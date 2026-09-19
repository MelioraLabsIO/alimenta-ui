"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "@/apiClient/client";
import type { SpinWinner } from "../types";

export type { SpinWinner };

interface SpinEvent {
    type: string;
    /** The backend spells this `sessionID` on `spin.completed`; other events use `sessionId`. */
    sessionId?: string;
    sessionID?: string;
    data: unknown;
}

/**
 * The event's `data` object comes over the wire with PascalCase keys (`Id`,
 * `FoodName`, …), unlike the REST `SpinWinner`, so we normalize it here once.
 */

export interface UseSpinRealtimeResult {
    /** The most recent `spin.completed` winner, or `null` before any spin. */
    winner: SpinWinner | null;
    /**
     * Bumped once per `spin.completed` event. Feed it into
     * `MealSpinWheel`'s `SpinTrigger.seq` so the wheel re-animates even when
     * the same participant wins twice in a row.
     */
    spinSeq: number;
}

function pick(record: Record<string, unknown>, ...keys: string[]): string {
    for (const key of keys) {
        const value = record[key];
        if (typeof value === "string" && value.length > 0) return value;
    }
    return "";
}

function parseSpinWinner(data: unknown): SpinWinner | null {
    if (!data || typeof data !== "object") return null;
    const record = data as Record<string, unknown>;
    const id = pick(record, "Id", "id");
    if (!id) return null;
    return {
        id,
        sessionId: pick(record, "SessionId", "sessionId"),
        userId: pick(record, "UserId", "userId"),
        displayName: pick(record, "DisplayName", "displayName"),
        foodName: pick(record, "FoodName", "foodName"),
        createdAt: pick(record, "CreatedAt", "createdAt"),
    };
}

export function useSpinRealtime(
    sessionId: string | null | undefined
): UseSpinRealtimeResult {
    const queryClient = useQueryClient();
    const [winner, setWinner] = useState<SpinWinner | null>(null);
    const [spinSeq, setSpinSeq] = useState(0);

    // Keep a live ref so the socket's `onmessage` closure always increments
    // from the current value without re-subscribing on every event.
    const spinSeqRef = useRef(0);

    useEffect(() => {
        if (!sessionId) {
            return;
        }

        // The realtime endpoint lives on the backend API, not the Next
        // server, so derive its host from BASE_URL (http://localhost:8080 in
        // dev, NEXT_PUBLIC_API_URL otherwise) rather than window.location.
        // Swapping the leading "http" turns http/https into ws/wss.
        const wsBase = (BASE_URL ?? window.location.origin).replace(
            /^http/,
            "ws"
        );

        const socket = new WebSocket(
            `${wsBase}/api/v1/spin-sessions/ws/spin/${sessionId}`
        );

        const invalidate = () => {
            // Authenticated members key on ["session"]; guests on
            // ["guest-session", …]. Neither prefix-matches the other, so
            // refresh both and let whichever query is mounted refetch.
            queryClient.invalidateQueries({ queryKey: ["session"] });
            queryClient.invalidateQueries({ queryKey: ["guest-session"] });
        };

        socket.onopen = () => {
            // Ensure our snapshot is current after subscribing.
            invalidate();
        };

        socket.onmessage = (message) => {
            let event: SpinEvent;
            try {
                event = JSON.parse(message.data);
            } catch {
                return;
            }

            if (event.type === "spin.completed") {
                const parsed = parseSpinWinner(event.data);
                if (parsed) {
                    setWinner(parsed);
                    spinSeqRef.current += 1;
                    setSpinSeq(spinSeqRef.current);
                }
            }

            invalidate();
        };

        socket.onerror = (error) => {
            console.error("Spin realtime error:", error);
        };

        return () => {
            socket.close();
        };
    }, [sessionId, queryClient]);

    return { winner, spinSeq };
}
