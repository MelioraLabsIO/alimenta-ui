"use client";

import { useCallback, useState } from "react";
import type {
    SharedEntry,
    SharedSession,
    UseSharedSessionReturn,
} from "./types";

// ---------------------------------------------------------------------------
// FIXTURE DATA
// Replace this block once real API + WebSocket endpoints exist.
// ---------------------------------------------------------------------------
const FIXTURE_CURRENT_USER_ID = "user-you";

const FIXTURE_SESSION: SharedSession = {
    id: "session-abc123",
    code: "7K3D9P",
    hostId: FIXTURE_CURRENT_USER_ID,
    participants: [
        {
            id: FIXTURE_CURRENT_USER_ID,
            name: "You",
            initials: "YO",
            isHost: true,
            isConnected: true,
        },
        {
            id: "user-john",
            name: "John",
            initials: "JO",
            isHost: false,
            isConnected: true,
        },
        {
            id: "user-maria",
            name: "Maria",
            initials: "MA",
            isHost: false,
            isConnected: true,
        },
        {
            id: "user-alex",
            name: "Alex",
            initials: "AL",
            isHost: false,
            isConnected: true,
        },
    ],
    entries: [
        {
            id: "entry-1",
            participantId: FIXTURE_CURRENT_USER_ID,
            participantName: "You",
            food: "White Rice",
        },
        {
            id: "entry-2",
            participantId: "user-john",
            participantName: "John",
            food: "Pizza",
        },
        {
            id: "entry-3",
            participantId: "user-maria",
            participantName: "Maria",
            food: "Pasta",
        },
        {
            id: "entry-4",
            participantId: "user-alex",
            participantName: "Alex",
            food: "Broccoli and rice",
        },
    ],
    status: "waiting",
    winnerId: null,
};
// ---------------------------------------------------------------------------

function makeEntryId() {
    return `entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Manages all state for an authenticated shared spin session.
 *
 * Currently backed by fixture data. To wire up the real backend:
 * 1. Replace the initial `useState(FIXTURE_SESSION)` with a real query.
 * 2. Replace `setSession` mutations with API / WebSocket mutations.
 * 3. Replace `FIXTURE_CURRENT_USER_ID` with the authenticated user's ID.
 */
export function useSharedSession(): UseSharedSessionReturn {
    const [session, setSession] = useState<SharedSession>(FIXTURE_SESSION);
    const [spinSeq, setSpinSeq] = useState(0);

    const currentUserId = FIXTURE_CURRENT_USER_ID;
    const isHost = session.hostId === currentUserId;

    const addEntry = useCallback(
        (food: string) => {
            const trimmed = food.trim();
            if (!trimmed) return;

            const participant = session.participants.find(
                (p) => p.id === currentUserId
            );
            if (!participant) return;

            const newEntry: SharedEntry = {
                id: makeEntryId(),
                participantId: currentUserId,
                participantName: participant.name,
                food: trimmed,
            };

            setSession((prev) => ({
                ...prev,
                entries: [...prev.entries, newEntry],
            }));
        },
        [session.participants, currentUserId]
    );

    const removeEntry = useCallback(
        (entryId: string) => {
            setSession((prev) => {
                const entry = prev.entries.find((e) => e.id === entryId);
                if (!entry) return prev;
                // Host can remove any entry; others can only remove their own.
                const canRemove =
                    isHost || entry.participantId === currentUserId;
                if (!canRemove) return prev;
                return {
                    ...prev,
                    entries: prev.entries.filter((e) => e.id !== entryId),
                };
            });
        },
        [isHost, currentUserId]
    );

    const clearAllEntries = useCallback(() => {
        if (!isHost) return;
        setSession((prev) => ({ ...prev, entries: [] }));
    }, [isHost]);

    const requestSpin = useCallback(() => {
        if (!isHost || session.entries.length === 0) return;

        setSession((prev) => ({ ...prev, status: "spinning", winnerId: null }));

        // TODO: replace with real backend call + WebSocket listener.
        // The backend should pick the winner and push the winnerId.
        // For now we simulate a 1.5 s network round-trip then return a winner.
        const randomWinnerIndex = Math.floor(
            Math.random() * session.entries.length
        );
        const winnerId = session.entries[randomWinnerIndex].id;

        setTimeout(() => {
            setSession((prev) => ({
                ...prev,
                status: "complete",
                winnerId,
            }));
            setSpinSeq((s) => s + 1);
        }, 1500);
    }, [isHost, session.entries]);

    // Expose spinSeq so the wheel can detect a new server result.
    // Attach it as a custom field on the returned object; the Shared component
    // reads it to build the SpinTrigger passed to MealSpinWheel.
    const _spinSeq = spinSeq;

    return {
        session,
        isLoading: false,
        error: null,
        currentUserId,
        isHost,
        addEntry,
        removeEntry,
        clearAllEntries,
        requestSpin,
        _spinSeq,
    } as UseSharedSessionReturn & { _spinSeq: number };
}



