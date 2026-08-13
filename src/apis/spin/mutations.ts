import { apiFetch } from "@/apiClient/client";
import {
    JoinSpinSessionResponse,
    SpinSession,
    SpinSessionParticipant,
    UpsertParticipantFoodParams,
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

/** Removes a participant, identified by the current authenticated member's Supabase session. */
export async function deleteSpinParticipantAsMember(
    joinCode: string,
    participantId: string
): Promise<void> {
    return apiFetch(
        `/api/v1/spin-sessions/${joinCode}/participants/${participantId}`,
        { method: "DELETE" }
    );
}

/**
 * Removes a participant on behalf of a guest, identified by their
 * `participantToken` (from `sessionStorage`) via the `X-Participant-Token`
 * header.
 */
export async function deleteSpinParticipantAsGuest(
    joinCode: string,
    participantId: string,
    participantToken: string
): Promise<void> {
    return apiFetch(
        `/api/v1/spin-sessions/${joinCode}/participants/${participantId}`,
        {
            method: "DELETE",
            headers: { "X-Participant-Token": participantToken },
        },
        { useSession: false }
    );
}

/**
 * Sets (or clears, via `foodName: null`) the food choice for the current
 * authenticated member, identified by the Supabase session.
 */
export async function upsertParticipantFoodAsMember(
    joinCode: string,
    params: UpsertParticipantFoodParams
): Promise<SpinSessionParticipant> {
    return apiFetch<SpinSessionParticipant>(
        `/api/v1/spin-sessions/${joinCode}/me/food`,
        {
            method: "PUT",
            body: JSON.stringify(params),
        }
    );
}

/**
 * Sets (or clears, via `foodName: null`) the food choice for the current
 * guest, identified by their `participantToken` (from `sessionStorage`) via
 * the `X-Participant-Token` header.
 */
export async function upsertParticipantFoodAsGuest(
    joinCode: string,
    params: UpsertParticipantFoodParams,
    participantToken: string
): Promise<SpinSessionParticipant> {
    return apiFetch<SpinSessionParticipant>(
        `/api/v1/spin-sessions/${joinCode}/me/food`,
        {
            method: "PUT",
            body: JSON.stringify(params),
            headers: { "X-Participant-Token": participantToken },
        },
        { useSession: false }
    );
}
