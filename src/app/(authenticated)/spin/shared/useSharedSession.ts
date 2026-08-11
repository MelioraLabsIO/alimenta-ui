"use client";

import { useCallback } from "react";
import type { UseSharedSessionReturn } from "./types";
import { useQuery } from "@tanstack/react-query";
import { getActiveSession } from "@/apis/spin/queries";
import { User } from "@supabase/supabase-js";

export function useSharedSession(user: User | null): UseSharedSessionReturn {
    const {
        data: spinSession,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["session"],
        queryFn: getActiveSession,
        enabled: Boolean(user?.id),
    });

    const currentUserId = user?.id ?? "";
    const isHost = spinSession?.hostUserId === currentUserId;
    const currentParticipantId =
        spinSession?.spinParticipants.find((p) => p.userId === currentUserId)
            ?.id ?? "";

    const addEntry: UseSharedSessionReturn["addEntry"] = useCallback(() => {
        // TODO: wire shared-entry mutation.
    }, []);

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
        addEntry,
        removeEntry,
        clearAllEntries,
        requestSpin,
    };
}
