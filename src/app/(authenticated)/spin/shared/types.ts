/**
 * Domain types for an authenticated shared spin-wheel session.
 *
 * These mirror the real `/api/v1/spin-sessions/{joinCode}` response shape.
 * There is no separate "entries" collection — each participant carries at
 * most one food choice directly (`foodName`, empty until they add one), and
 * there is no `isHost`/`isConnected` flag on a participant — host status is
 * derived by comparing identity against `SpinSession.hostUserId`, and there
 * is currently no live-presence signal from the backend.
 */

export type SessionStatus = "lobby" | "waiting" | "spinning" | "complete";

export type SpinSessionParticipant = {
    /** Stable backend-assigned participant (session-join) ID. */
    id: string;
    sessionId: string;
    /**
     * The joining user's auth ID. Empty string for anonymous guests — do
     * not use this to identify "the current viewer"; use the participant's
     * own `id` instead (see `SpinSession.spinParticipants`).
     */
    userId: string;
    displayName: string;
    /** Omitted entirely by the backend until this participant picks a food. */
    foodName?: string;
    createdAt: Date;
    /** Guest join token. Empty string for authenticated members. */
    participantToken: string;
};

/** Response shape returned when a participant joins a session. */
export type JoinSpinSessionResponse = {
    participant: SpinSessionParticipant;
    /** Guest join token, stored client-side. `null` for authenticated members. */
    participantToken: string | null;
};

export type SpinSession = {
    id: string;
    /** Short alphanumeric code participants use to join. */
    joinCode: string;
    hostUserId: string;
    status: SessionStatus;
    expiresAt: Date;
    createdAt: Date;
    spinParticipants: SpinSessionParticipant[];
};

export type UseSharedSessionReturn = {
    session: SpinSession | null;
    isLoading: boolean;
    error: string | null;
    /** ID of the currently authenticated user (empty string for guests). */
    currentUserId: string;
    /** ID of the current viewer's own participant row — use this to identify "my" entry. */
    currentParticipantId: string;
    isHost: boolean;
    /** Sets the food choice for the current user's participant row. */
    addEntry: (food: string) => void;
    /** Clears a participant's food choice by participant ID (host can remove any, others only their own). */
    removeEntry: (participantId: string) => void;
    /** Host-only: clears every participant's food choice. */
    clearAllEntries: () => void;
    /**
     * Host-only: sends a spin request to the backend.
     * TODO: no winner-result field exists on `SpinSession` yet — wire this up
     * once the backend adds one.
     */
    requestSpin: () => void;
};
