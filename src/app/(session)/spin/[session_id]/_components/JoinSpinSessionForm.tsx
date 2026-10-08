"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
    Avatar,
    Box,
    Button,
    Group,
    Paper,
    Stack,
    Text,
    ThemeIcon,
} from "@mantine/core";
import { Dices, LogIn } from "lucide-react";
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
        <Paper
            radius="xxl"
            pt="xxl"
            px="xxl"
            pb="xxl"
            style={{
                border: "1px solid var(--bd)",
                animation: "alm-in 500ms var(--motion-spring)",
            }}
        >
            <Stack gap="xl">
                <Group gap="md" wrap="nowrap">
                    <ThemeIcon variant="gradient" size={40} radius="md">
                        <Dices size={19} />
                    </ThemeIcon>
                    <Box miw={0}>
                        <Text fz="xxl" fw={700} lts="var(--ls-snug)">
                            Join this session
                        </Text>
                        <Text fz="sm" c="var(--tx2)">
                            {participantCount === 0
                                ? "Be the first one in."
                                : `${participantCount} ${
                                      participantCount === 1
                                          ? "person is"
                                          : "people are"
                                  } already in.`}
                        </Text>
                    </Box>
                </Group>

                {currentUser ? (
                    <Stack gap="md">
                        <Paper radius="lg" p="md" bg="var(--sf2)" shadow="none">
                            <Group gap="md" wrap="nowrap">
                                <Avatar size={36} fz="xs">
                                    {getProfileInitials(currentUser)}
                                </Avatar>
                                <Box miw={0}>
                                    <Text fz="xs" c="var(--tx3)">
                                        Joining as
                                    </Text>
                                    <Text fz="md" fw={600} truncate>
                                        {currentUser.displayName}
                                    </Text>
                                </Box>
                            </Group>
                        </Paper>

                        <Button
                            size="lg"
                            radius="lg"
                            fullWidth
                            fw={700}
                            loading={isPending}
                            onClick={() => joinAsMember()}
                            leftSection={<LogIn size={16} />}
                        >
                            {isPending ? "Joining…" : "Join session"}
                        </Button>
                    </Stack>
                ) : (
                    <AnonymousJoinForm
                        session={session}
                        onJoinedParticipantAction={onJoinedAction}
                    />
                )}
            </Stack>
        </Paper>
    );
}
