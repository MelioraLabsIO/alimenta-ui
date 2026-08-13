"use client";

import { useQueries } from "@tanstack/react-query";
import { getSpinParticipant, getSpinSession } from "@/apis/spin/queries";
import { useParams } from "next/navigation";
import { useSessionStorage } from "@/hooks/useSessionStorage";

export function useGuestSession() {
    const params = useParams();
    const sessionCode = params.session_code as string;

    const [participantToken] = useSessionStorage(
        `spin:${sessionCode}:participant-token`
    );

    const [
        { data: sessionData, isLoading: sessionLoading },
        { data: participantData, isLoading: participantLoading },
    ] = useQueries({
        queries: [
            {
                queryKey: ["guest-session", sessionCode],
                queryFn: async () => getSpinSession(sessionCode),
            },
            {
                queryKey: ["guest-session", sessionCode, participantToken],
                queryFn: async () =>
                    getSpinParticipant(sessionCode, participantToken as string),
            },
        ],
    });

    return {
        session: sessionData,
        isLoadingSession: sessionLoading,
        participant: participantData,
        isLoadingParticipant: participantLoading,
    };
}
