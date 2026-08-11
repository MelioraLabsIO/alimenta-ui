"use client";

import {
    SpinSession,
    SpinSessionParticipant,
} from "@/app/(authenticated)/spin/shared/types";
import { getUserProfile } from "@/apis/profile/queries";
import { joinSpinSessionAsMember } from "@/apis/spin/mutations";
import { AnonymousJoinForm } from "@/app/(session)/spin/[session_code]/_components/AnonymousJoinForm";

type Props = {
    session: SpinSession;
    currentUser: Awaited<ReturnType<typeof getUserProfile>> | null;
    // Callbacks
    onJoinedAction: (participant: SpinSessionParticipant) => void;
};

export function JoinSpinSessionForm({
    session,
    currentUser,
    onJoinedAction,
}: Props) {
    if (currentUser) {
        return (
            <div>
                <h1>Join this session</h1>

                <p>Join as {currentUser.displayName}</p>

                <button
                    onClick={async () => {
                        const { participant } = await joinSpinSessionAsMember(
                            session.joinCode
                        );

                        onJoinedAction(participant);
                    }}
                >
                    Join session
                </button>
            </div>
        );
    }

    return (
        <AnonymousJoinForm
            session={session}
            onJoinedParticipantAction={onJoinedAction}
        />
    );
}
