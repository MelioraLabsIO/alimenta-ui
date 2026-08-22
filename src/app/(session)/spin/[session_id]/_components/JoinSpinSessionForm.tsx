"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Dices, LogIn } from "lucide-react";
import {
    Avatar,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/mantine/ui";
import {
    JoinSpinSessionResponse,
    SpinSession,
} from "@/app/(authenticated)/spin/shared/types";
import { getUserProfile } from "@/apis/profile/queries";
import { joinSpinSessionAsMember } from "@/apis/spin/mutations";
import { AnonymousJoinForm } from "@/app/(session)/spin/[session_id]/_components/AnonymousJoinForm";
import { hasAutojoinParam, routes } from "@/lib/routes";
import { getProfileInitials } from "@/lib/profile";
import { toast } from "@/lib/notifications";

type Props = {
    session: SpinSession;
    currentUser: Awaited<ReturnType<typeof getUserProfile>> | null;
    // Callbacks
    onJoinedAction: (result: JoinSpinSessionResponse) => void;
};

/**
 * The card a visitor lands on before they're part of the session. Signed-in
 * members get a one-tap confirm; everyone else gets the guest name form. Both
 * share this card's chrome so the two paths look like one screen.
 *
 * A member who joins doesn't stay on this guest route — they're sent straight
 * to `/spin/shared`, the authenticated room. `onJoinedAction` is only ever
 * reached via the guest path (`AnonymousJoinForm`), which does stay here.
 */
export function JoinSpinSessionForm({
    session,
    currentUser,
    onJoinedAction,
}: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const autoJoin = hasAutojoinParam(searchParams);
    const hasAutoJoined = useRef(false);

    const { mutate: joinAsMember, isPending } = useMutation({
        mutationFn: () => joinSpinSessionAsMember(session.id),
        onSuccess: () => router.replace(routes.spinShared()),
        onError: () => toast.error("Failed to join, please try again."),
    });

    // Coming back from `/login?next=...` after signing in to join this session:
    // finish the join automatically instead of leaving the user on another click.
    useEffect(() => {
        if (!currentUser || !autoJoin || hasAutoJoined.current) return;
        hasAutoJoined.current = true;

        // Drop `?autojoin=1` so a refresh doesn't try to join a second time
        // if the mutation below is still in flight.
        router.replace(routes.spinSession(session.id));

        joinAsMember();
    }, [currentUser, autoJoin, router, session.id, joinAsMember]);

    const participantCount = session.spinParticipants?.length ?? 0;

    return (
        <Card className="border-border/50 bg-card/60">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <span className="brand-mark shrink-0">
                        <Dices className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                        <CardTitle className="text-base font-semibold">
                            Join this session
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                            {participantCount === 0
                                ? "Be the first one in."
                                : `${participantCount} ${
                                      participantCount === 1
                                          ? "person is"
                                          : "people are"
                                  } already in.`}
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                {currentUser ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
                            <Avatar className="h-9 w-9 text-xs">
                                {getProfileInitials(currentUser)}
                            </Avatar>
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">
                                    Joining as
                                </p>
                                <p className="truncate text-sm font-medium">
                                    {currentUser.displayName}
                                </p>
                            </div>
                        </div>

                        <Button
                            size="lg"
                            fullWidth
                            loading={isPending}
                            onClick={() => joinAsMember()}
                            leftSection={<LogIn className="h-4 w-4" />}
                        >
                            {isPending ? "Joining…" : "Join session"}
                        </Button>
                    </div>
                ) : (
                    <AnonymousJoinForm
                        session={session}
                        onJoinedParticipantAction={onJoinedAction}
                    />
                )}
            </CardContent>
        </Card>
    );
}
