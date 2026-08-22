"use client";

import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { JoinSpinSessionForm } from "./JoinSpinSessionForm";
import { useProfileStore } from "@/stores/profile.store";
import { ParticipantRoom } from "@/app/(session)/spin/[session_id]/_components/ParticipantRoom";
import { useGuestSession } from "@/app/(session)/spin/[session_id]/hooks/useGuestSession";
import {
    JoinSpinSessionResponse,
    SpinSession,
    SpinSessionParticipant,
} from "@/app/(authenticated)/spin/shared/types";
import { Container } from "@mantine/core";
import { Unlink as LinkOff } from "lucide-react";
import { Card, CardContent } from "@/components/mantine/ui";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";

export function SharedSessionView() {
    const profile = useProfileStore((state) => state.profile);
    const queryClient = useQueryClient();
    const navigate = useRouter();

    // State
    const [joinedParticipant, setJoinedParticipant] =
        useState<SpinSessionParticipant | null>(null);

    const {
        sessionId,
        session,
        isLoadingSession,
        participant,
        isLoadingParticipant,
        sessionNotFound,
    } = useGuestSession();

    const resolvedParticipant = participant ?? joinedParticipant;

    // An authenticated member never has a guest `participantToken`, so
    // `resolvedParticipant` above stays empty for them even after they've
    // joined — without this check they'd land on the join form again on
    // every refresh. Members belong in `/spin/shared` (their active session,
    // resolved from their own auth), never in the guest room below.
    const alreadyJoinedAsMember = Boolean(
        profile &&
            session?.spinParticipants.some((p) => p.userId === profile.id)
    );

    useEffect(() => {
        if (alreadyJoinedAsMember) {
            navigate.replace(routes.spinShared());
        }
    }, [alreadyJoinedAsMember, navigate]);

    /********************************************* HANDLERS ************************************************/
    const handleParticipantJoined = useCallback(
        (joined: JoinSpinSessionResponse) => {
            setJoinedParticipant(joined.participant);
            queryClient.setQueryData(
                ["guest-session", sessionId],
                (cachedData: SpinSession) => {
                    return {
                        ...cachedData,
                        spinParticipants: [
                            ...(cachedData?.spinParticipants || []),
                            joined.participant,
                        ],
                    };
                }
            );
        },
        [queryClient, sessionId]
    );

    const handleParticipantLeft = useCallback(() => {
        setJoinedParticipant(null);
        navigate.push("/");
    }, [navigate]);

    if (sessionNotFound) {
        return (
            <Container size="sm" className="py-8 px-4">
                <Card className="border-border/50 bg-card/60">
                    <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
                        <LinkOff
                            className="h-10 w-10 text-muted-foreground/40"
                            aria-hidden="true"
                        />
                        <div className="space-y-1">
                            <p className="text-sm font-semibold">
                                This link isn&apos;t valid anymore
                            </p>
                            <p className="text-sm text-muted-foreground">
                                The session may have ended or expired. Ask the
                                host for a new one.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </Container>
        );
    }

    if (isLoadingSession || isLoadingParticipant || !session) {
        return (
            <Container size="sm" className="py-8 px-4">
                <div
                    className="flex flex-col items-center gap-3 py-24"
                    role="status"
                >
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">
                        Loading session…
                    </p>
                </div>
            </Container>
        );
    }

    // Redirecting to `/spin/shared` (see the effect above) — render its own
    // loading state rather than flashing the join form for an instant first.
    if (alreadyJoinedAsMember) {
        return (
            <Container size="sm" className="py-8 px-4">
                <div
                    className="flex flex-col items-center gap-3 py-24"
                    role="status"
                >
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">
                        Taking you to your session…
                    </p>
                </div>
            </Container>
        );
    }

    /*
     * The visitor hasn't joined yet.
     */
    if (!resolvedParticipant) {
        return (
            <Container size="sm" className="py-8 px-4">
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
    // Wider than the states above: the room is a two-column grid, and `sm`
    // (~540px) never lets `lg:grid-cols-2` open up. This matches the
    // authenticated spin layout's container.
    return (
        <Container size="lg" className="py-8 px-4">
            <ParticipantRoom
                session={session}
                participant={resolvedParticipant}
                onLeftAction={handleParticipantLeft}
            />
        </Container>
    );
}
