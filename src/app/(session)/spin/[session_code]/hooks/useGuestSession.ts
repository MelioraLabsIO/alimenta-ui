"use client";

import { useQueries } from "@tanstack/react-query";
import { getSpinParticipant, getSpinSession } from "@/apis/spin/queries";
import { useParams } from "next/navigation";

export function useGuestSession() {
    const params = useParams();
    const sessionCode = params.session_code as string;

    let participantToken = "";
    if (typeof window !== "undefined") {
        participantToken = window.sessionStorage.getItem(
            `spin:${sessionCode}:participant-token`
        ) as string;
    }

    console.log("participantToken", participantToken);

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
