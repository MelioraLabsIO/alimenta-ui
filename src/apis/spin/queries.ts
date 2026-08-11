import { apiFetch } from "@/apiClient/client";
import {
    SpinSession,
    SpinSessionParticipant,
} from "@/app/(authenticated)/spin/shared/types";

export function getActiveSession(): Promise<SpinSession> {
    console.log("Fetching active spin session");
    return apiFetch("/api/v1/spin-sessions/active");
}

export function getSpinSession(joinCode: string): Promise<SpinSession> {
    return apiFetch(
        `/api/v1/spin-sessions/${joinCode}`,
        {
            method: "GET",
        },
        { useSession: false }
    );
}

export function getSpinParticipant(
    joinCode: string,
    participantToken: string
): Promise<SpinSessionParticipant> {
    return apiFetch(
        `/api/v1/spin-sessions/${joinCode}/participant`,
        {
            method: "GET",
            headers: {
                "X-Participant-Token": participantToken,
            },
        },
        { useSession: false }
    );
}
