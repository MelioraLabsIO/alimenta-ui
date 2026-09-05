"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "@/apiClient/client";

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
        // ws://localhost:8080/api/v1/spin-sessions/ws/spin/{id}

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
