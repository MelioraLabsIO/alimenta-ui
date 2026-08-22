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
    sessionId: string
): Promise<JoinSpinSessionResponse> {
    return apiFetch(`/api/v1/spin-sessions/${sessionId}/join/me`, {
        method: "POST",
    });
}

export async function joinSpinSessionAsGuest(
    sessionId: string,
    name: string
): Promise<JoinSpinSessionResponse> {
    return apiFetch(
        `/api/v1/spin-sessions/${sessionId}/join`,
        {
            method: "POST",
            body: JSON.stringify({ name }),
        },
        { useSession: false }
    );
}

/** Removes another participant by ID — a host-only action. */
export function deleteSpinParticipant(
    sessionId: string,
    participantId: string
): Promise<boolean> {
    return apiFetch(
        `/api/v1/spin-sessions/${sessionId}/participants/${participantId}`,
        {
            method: "DELETE",
        }
    );
}

/** Deletes the entire session — a host-only action; the host can't leave it any other way. */
export function deleteSpinSession(sessionId: string): Promise<boolean> {
    return apiFetch(`/api/v1/spin-sessions/${sessionId}`, {
        method: "DELETE",
    });
}

/** Removes a participant, identified by the current authenticated member's Supabase session. */
export async function leaveSessionAsMember(
    sessionId: string
): Promise<Pick<SpinSessionParticipant, "id" | "userId" | "displayName">> {
    return apiFetch(`/api/v1/spin-sessions/${sessionId}/participants/me`, {
        method: "DELETE",
    });
}

/**
 * Removes a participant on behalf of a guest, identified by their
 * `participantToken` (from `sessionStorage`) via the `X-Participant-Token`
 * header.
 */
export async function leaveSessionAsGuest(
    sessionId: string,
    participantToken: string
): Promise<Pick<SpinSessionParticipant, "id">> {
    return apiFetch(
        `/api/v1/spin-sessions/${sessionId}/participants/me`,
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
    sessionId: string,
    params: UpsertParticipantFoodParams
): Promise<SpinSessionParticipant> {
    return apiFetch<SpinSessionParticipant>(
        `/api/v1/spin-sessions/${sessionId}/me/food`,
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
    sessionId: string,
    params: UpsertParticipantFoodParams,
    participantToken: string
): Promise<SpinSessionParticipant> {
    return apiFetch<SpinSessionParticipant>(
        `/api/v1/spin-sessions/${sessionId}/me/food`,
        {
            method: "PUT",
            body: JSON.stringify(params),
            headers: { "X-Participant-Token": participantToken },
        },
        { useSession: false }
    );
}
