"use client";

import { useState } from "react";
import { JoinSpinSessionForm } from "./JoinSpinSessionForm";
import { useProfileStore } from "@/stores/profile.store";
import { ParticipantRoom } from "@/app/(session)/spin/[session_code]/_components/ParticipantRoom";
import { useGuestSession } from "@/app/(session)/spin/[session_code]/hooks/useGuestSession";
import type { SpinSessionParticipant } from "@/app/(authenticated)/spin/shared/types";

export function SharedSessionView() {
    const profile = useProfileStore((state) => state.profile);
    const [joinedParticipant, setJoinedParticipant] =
        useState<SpinSessionParticipant | null>(null);

    const { session, isLoadingSession, participant, isLoadingParticipant } =
        useGuestSession();

    const resolvedParticipant = participant ?? joinedParticipant;

    /*    useEffect(() => {
        async function initialize() {
            try {
                /!*
                 * These can eventually be handled through your query library
                 * rather than raw fetch calls.
                 *!/

                const sessionResult = await getSpinSession(sessionCode);

                setSession(sessionResult);

                /!*
                 * Recovery path for someone who already joined.
                 *!/
                const token = sessionStorage.getItem(
                    `spin:${sessionCode}:participant-token`
                );

                if (token) {
                    const restoredParticipant = await getCurrentSpinParticipant(
                        sessionCode,
                        token
                    );

                    setParticipant(restoredParticipant);
                    return;
                }

                /!*
                 * Authenticated users may already have a participant row.
                 *
                 * For example, the host is inserted into spin_participants
                 * when the room is created.
                 *!/
                if (user) {
                    const existingParticipant =
                        await getAuthenticatedParticipant(sessionCode);

                    if (existingParticipant) {
                        setParticipant(existingParticipant);
                    }
                }
            } finally {
                setLoading(false);
            }
        }

        // initialize();
    }, [sessionCode, user])*/

    if (isLoadingSession || isLoadingParticipant || !session) {
        return <div>Loading session...</div>;
    }

    /*
     * The visitor hasn't joined yet.
     */

    if (!resolvedParticipant) {
        return (
            <JoinSpinSessionForm
                session={session}
                currentUser={profile}
                onJoinedAction={setJoinedParticipant}
            />
        );
    }

    /*
     * Once joined, everyone gets essentially the same room.
     *
     * Account capabilities can be enabled based on `user`.
     */
    return (
        <ParticipantRoom
            session={session}
            participant={resolvedParticipant}
            authenticatedUser={profile}
        />
    );
}
