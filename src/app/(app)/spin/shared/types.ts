/**
 * Domain types for an authenticated shared spin-wheel session.
 *
 * These are frontend contracts only. Replace the placeholder API calls in
 * `useSharedSession.ts` once backend endpoints are available.
 */

export type SessionStatus = "lobby" | "waiting" | "spinning" | "complete";

export type CreateSessionResponse = {
    id: string;
    joinCode: string;
    hostUserId: string;
    status: SessionStatus;
    joinURL: string;
    expiresAt: Date;
    createdAt: Date;
};

export type SessionParticipant = {
    /** Stable backend-assigned user / connection ID. */
    id: string;
    displayName: string;
    userId: string;
    foodName?: string;
    createdAt: Date;
    isHost: boolean;
    /** Live presence – set by WebSocket heartbeat. */
    isConnected: boolean;
};

/** A single participant's food entry submitted for the wheel. */
export type SharedEntry = {
    /** Stable entry ID assigned by the backend. */
    id: string;
    participantId: string;
    participantName: string;
    food: string;
};

export type SharedSession = {
    id: string;
    hostUserId: string;
    /** Short alphanumeric code participants use to join. */
    joinCode: string;
    joinURL: string;
    expiresAt: Date;
    createdAt: Date;
    hostId: string;
    spinParticipants: SessionParticipant[];
    entries: SharedEntry[];
    status: SessionStatus;
    spinParticipants: SessionParticipant[];
    // After Spinning

    /**
     * ID of the winning SharedEntry chosen by the backend.
     * `null` until the host initiates a spin and the backend responds.
     */
    winnerId: string | null;
};

export type UseSharedSessionReturn = {
    session: SharedSession | null;
    isLoading: boolean;
    error: string | null;
    /** ID of the currently authenticated user. */
    currentUserId: string;
    isHost: boolean;
    /** Adds a food entry for the current user. */
    addEntry: (food: string) => void;
    /** Removes an entry by its stable ID (host can remove any, others only their own). */
    removeEntry: (entryId: string) => void;
    /** Host-only: removes all entries. */
    clearAllEntries: () => void;
    /**
     * Host-only: sends a spin request to the backend.
     * The winner arrives via `session.winnerId` (WebSocket / polling).
     */
    requestSpin: () => void;
};
