"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface SpinEvent {
    type: string;
    sessionId: string;
    data: unknown;
}

export function useSpinRealtime(sessionId: string | null | undefined) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!sessionId) {
            return;
        }

        const socket = new WebSocket(
            `ws://localhost:8080/api/v1/spin-sessions/ws/spin/${sessionId}`
        );

        socket.onopen = () => {
            console.log("Spin realtime connected");

            // Ensure our snapshot is current after subscribing.
            queryClient.invalidateQueries({
                queryKey: ["session"],
            });
        };

        socket.onmessage = (message) => {
            const event: SpinEvent = JSON.parse(message.data);
            console.log("Spin event received:", event);

            queryClient.invalidateQueries({
                queryKey: ["session"],
            });
        };

        socket.onerror = (error) => {
            console.error("Spin realtime error:", error);
        };

        socket.onclose = () => {
            console.log("Spin realtime disconnected");
        };

        return () => {
            socket.close();
        };
    }, [sessionId, queryClient]);
}
