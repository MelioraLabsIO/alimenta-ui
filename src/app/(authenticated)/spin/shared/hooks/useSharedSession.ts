"use client";

import { useCallback } from "react";
import type { SpinSession, UseSharedSessionReturn } from "../types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getActiveSession } from "@/apis/spin/queries";
import {
    pickSpinWinner,
    upsertParticipantFoodAsMember,
} from "@/apis/spin/mutations";
import { User } from "@supabase/supabase-js";
import { toast } from "@/lib/notifications";

export function useSharedSession(user: User | null): UseSharedSessionReturn {
    const queryClient = useQueryClient();

    const {
        data: spinSession,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["session"],
        queryFn: getActiveSession,
        // TODO: Ensure that this session is fetched only when the user is a participant, if not he shall not see the session
        enabled: Boolean(user?.id),
        retry: 1,
    });

    const currentUserId = user?.id ?? "";
    const isHost = spinSession?.hostUserId === currentUserId;
    const currentParticipantId =
        spinSession?.spinParticipants.find((p) => p.userId === currentUserId)
            ?.id ?? "";

    const { mutate: upsertFoodMutation } = useMutation({
        mutationFn: (payload: {
            foodName: string;
            participantId: string;
            sessionId: string;
        }) =>
            upsertParticipantFoodAsMember(payload.sessionId, {
                foodName: payload.foodName,
                id: payload.participantId,
                sessionId: payload.sessionId,
            }),
        onSuccess: (updatedParticipant) => {
            queryClient.setQueryData(
                ["session"],
                (current: SpinSession | undefined) =>
                    current
                        ? {
                              ...current,
                              spinParticipants: current.spinParticipants.map(
                                  (p) =>
                                      p.id === updatedParticipant.id
                                          ? updatedParticipant
                                          : p
                              ),
                          }
                        : current
            );
        },
    });

    const addEntry: UseSharedSessionReturn["addFood"] = useCallback(
        (food: string) => {
            if (!spinSession || !currentParticipantId) return;

            upsertFoodMutation({
                foodName: food,
                participantId: currentParticipantId,
                sessionId: spinSession.id,
            });
        },
        [spinSession, currentParticipantId, upsertFoodMutation]
    );

    const removeEntry: UseSharedSessionReturn["removeEntry"] =
        useCallback(() => {
            // TODO: wire remove-entry mutation.
        }, []);

    const clearAllEntries = useCallback(() => {
        if (!isHost) return;
        // TODO: wire clear-all mutation.
    }, [isHost]);

    const { mutate: pickWinnerMutation } = useMutation({
        mutationFn: (sessionId: string) => pickSpinWinner(sessionId),
        // The winner is delivered to every participant (host included) via the
        // `spin.completed` WebSocket event, which drives the wheel animation
        // and the winner dialog — so there's nothing to do with the response
        // here beyond letting realtime invalidation refresh the session.
        onError: () =>
            toast.error("Couldn't spin the wheel. Please try again."),
    });

    const requestSpin = useCallback(() => {
        if (!isHost || !spinSession) return;
        pickWinnerMutation(spinSession.id);
    }, [isHost, spinSession, pickWinnerMutation]);

    return {
        session: spinSession ?? null,
        isLoading,
        error: error ? error.message : null,
        currentUserId,
        currentParticipantId,
        isHost,
        addFood: addEntry,
        removeEntry,
        clearAllEntries,
        requestSpin,
    };
}
