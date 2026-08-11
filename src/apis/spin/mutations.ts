import { apiFetch } from "@/apiClient/client";
import {
    JoinSpinSessionResponse,
    SpinSession,
} from "@/app/(authenticated)/spin/shared/types";

export async function createSpinSession(): Promise<SpinSession> {
    console.log("Here before api call");
    return apiFetch("/api/v1/spin-sessions", { method: "POST" });
}

export async function joinSpinSessionAsMember(
    joinCode: string
): Promise<JoinSpinSessionResponse> {
    return apiFetch(`/api/v1/spin-sessions/${joinCode}/join/me`, {
        method: "POST",
    });
}

export async function joinSpinSessionAsGuest(
    joinCode: string,
    name: string
): Promise<JoinSpinSessionResponse> {
    console.log(`Joining spin session as guest: ${joinCode}, name: ${name}`);
    return apiFetch(
        `/api/v1/spin-sessions/${joinCode}/join`,
        {
            method: "POST",
            body: JSON.stringify({ name }),
        },
        { useSession: false }
    );
}
