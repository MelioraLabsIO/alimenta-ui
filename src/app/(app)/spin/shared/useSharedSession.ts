"use client";

import { useCallback } from "react";
import type { UseSharedSessionReturn } from "./types";
import { useQuery } from "@tanstack/react-query";
import { getSpinSession } from "@/apis/spin/queries";
import { User } from "@supabase/supabase-js";

export function useSharedSession(user: User | null): UseSharedSessionReturn {
    const {
        data: spinSession,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["session"],
        queryFn: getSpinSession,
        enabled: Boolean(user?.id),
    });

    const currentUserId = user?.id ?? "";
    const isHost = spinSession?.hostId === currentUserId;

    const addEntry: UseSharedSessionReturn["addEntry"] = useCallback(() => {
        // TODO: wire shared-entry mutation.
    }, []);

    const removeEntry: UseSharedSessionReturn["removeEntry"] = useCallback(() => {
        // TODO: wire remove-entry mutation.
    }, []);

    const clearAllEntries = useCallback(() => {
        if (!isHost) return;
        // TODO: wire clear-all mutation.
    }, [isHost]);

    const requestSpin = useCallback(() => {
        // TODO: wire host spin mutation that returns/publishes winnerId.
    }, []);

    return {
        session: spinSession ?? null,
        isLoading,
        error: error ? error.message : null,
        currentUserId,
        isHost,
        addEntry,
        removeEntry,
        clearAllEntries,
        requestSpin,
    };
}
