"use client";

import { useCallback } from "react";
import type { SpinSession, UseSharedSessionReturn } from "../types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getActiveSession } from "@/apis/spin/queries";
import { upsertParticipantFoodAsMember } from "@/apis/spin/mutations";
import { User } from "@supabase/supabase-js";

export function useSharedSession(user: User | null): UseSharedSessionReturn {
    const queryClient = useQueryClient();

    const {
        data: spinSession,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["session"],
        queryFn: getActiveSession,
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
            sessionCode: string;
            participantId: string;
            sessionId: string;
        }) =>
            upsertParticipantFoodAsMember(payload.sessionCode, {
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
                sessionCode: spinSession.sessionCode,
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

    const requestSpin = useCallback(() => {
        // TODO: wire host spin mutation once the backend exposes a winner.
    }, []);

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
