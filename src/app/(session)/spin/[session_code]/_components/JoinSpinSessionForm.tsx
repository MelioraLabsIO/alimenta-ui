"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    JoinSpinSessionResponse,
    SpinSession,
} from "@/app/(authenticated)/spin/shared/types";
import { getUserProfile } from "@/apis/profile/queries";
import { joinSpinSessionAsMember } from "@/apis/spin/mutations";
import { AnonymousJoinForm } from "@/app/(session)/spin/[session_code]/_components/AnonymousJoinForm";
import { hasAutojoinParam, routes } from "@/lib/routes";
import { Stack } from "@mantine/core";

type Props = {
    session: SpinSession;
    currentUser: Awaited<ReturnType<typeof getUserProfile>> | null;
    // Callbacks
    onJoinedAction: (result: JoinSpinSessionResponse) => void;
};

export function JoinSpinSessionForm({
    session,
    currentUser,
    onJoinedAction,
}: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const autoJoin = hasAutojoinParam(searchParams);
    const hasAutoJoined = useRef(false);

    // Coming back from `/login?next=...` after signing in to join this session:
    // finish the join automatically instead of leaving the user on another click.
    useEffect(() => {
        if (!currentUser || !autoJoin || hasAutoJoined.current) return;
        hasAutoJoined.current = true;

        router.replace(routes.spinShared(session.sessionCode));

        joinSpinSessionAsMember(session.sessionCode).then(onJoinedAction);
    }, [currentUser, autoJoin, router, session.sessionCode, onJoinedAction]);

    if (currentUser) {
        return (
            <Stack gap={2}>
                <h1>Join this session</h1>

                <p>Join as {currentUser.displayName}</p>

                <button
                    onClick={async () => {
                        onJoinedAction(
                            await joinSpinSessionAsMember(session.sessionCode)
                        );
                    }}
                >
                    Join session
                </button>
            </Stack>
        );
    }

    return (
        <AnonymousJoinForm
            session={session}
            onJoinedParticipantAction={onJoinedAction}
        />
    );
}
