"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { JoinSpinSessionForm } from "./JoinSpinSessionForm";
import { useProfileStore } from "@/stores/profile.store";
import { ParticipantRoom } from "@/app/(session)/spin/[session_code]/_components/ParticipantRoom";
import { useGuestSession } from "@/app/(session)/spin/[session_code]/hooks/useGuestSession";
import type { SpinSessionParticipant } from "@/app/(authenticated)/spin/shared/types";
import { Container } from "@mantine/core";
import { useRouter } from "next/navigation";

export function SharedSessionView() {
    const profile = useProfileStore((state) => state.profile);
    const queryClient = useQueryClient();
    const navigate = useRouter();

    // State
    const [joinedParticipant, setJoinedParticipant] =
        useState<SpinSessionParticipant | null>(null);

    const { session, isLoadingSession, participant, isLoadingParticipant } =
        useGuestSession();

    const resolvedParticipant = participant ?? joinedParticipant;

    /********************************************* HANDLERS ************************************************/
    const handleParticipantJoined = (joined: SpinSessionParticipant) => {
        setJoinedParticipant(joined);
    };

    const handleParticipantLeft = () => {
        setJoinedParticipant(null);
        queryClient.removeQueries({
            queryKey: ["guest-session", session?.sessionCode],
        });
        navigate.push("/");
    };

    if (isLoadingSession || isLoadingParticipant || !session) {
        return (
            <Container size="sm" className="py-8">
                Loading session...
            </Container>
        );
    }

    /*
     * The visitor hasn't joined yet.
     */
    if (!resolvedParticipant) {
        return (
            <Container size="sm" className="py-8">
                <JoinSpinSessionForm
                    session={session}
                    currentUser={profile}
                    onJoinedAction={handleParticipantJoined}
                />
            </Container>
        );
    }

    /*
     * Once joined, everyone gets essentially the same room.
     *
     * Account capabilities can be enabled based on `user`.
     */
    return (
        <Container size="sm" className="py-8">
            <ParticipantRoom
                session={session}
                participant={resolvedParticipant}
                onLeftAction={handleParticipantLeft}
            />
        </Container>
    );
}
