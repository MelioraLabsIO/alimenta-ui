"use client";

import { useQueries } from "@tanstack/react-query";
import { getSpinParticipant, getSpinSession } from "@/apis/spin/queries";
import { useParams } from "next/navigation";
import { useSessionStorage } from "@/hooks/useSessionStorage";

export function useGuestSession() {
    const params = useParams();
    // The `/spin/[session_id]` slug *is* the real session ID
    const sessionId = params.session_id as string;

    const [participantToken] = useSessionStorage(
        `spin:${sessionId}:participant-token`
    );

    const [sessionQuery, participantQuery] = useQueries({
        queries: [
            {
                queryKey: ["guest-session", sessionId],
                queryFn: () => getSpinSession(sessionId),
                enabled: Boolean(sessionId),
                retry: 1,
            },
            {
                queryKey: ["guest-session", sessionId, participantToken],
                queryFn: () =>
                    getSpinParticipant(sessionId, participantToken as string),
                enabled: Boolean(sessionId && participantToken),
            },
        ],
    });

    return {
        sessionId,
        session: sessionQuery.data,
        isLoadingSession: sessionQuery.isLoading,
        participant: participantQuery.data,
        isLoadingParticipant: participantQuery.isLoading,
        /** True when the ID in the URL doesn't resolve to a session — a dead or expired link. */
        sessionNotFound: sessionQuery.isError,
    };
}
