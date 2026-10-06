"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
    Box,
    Button,
    Center,
    Loader,
    Paper,
    Stack,
    Text,
    ThemeIcon,
} from "@mantine/core";
import { Link2Off, PartyPopper } from "lucide-react";
import { JoinSpinSessionForm } from "./JoinSpinSessionForm";
import { useProfileStore } from "@/stores/profile.store";
import { ParticipantRoom } from "@/app/(session)/spin/[session_id]/_components/ParticipantRoom";
import { useGuestSession } from "@/app/(session)/spin/[session_id]/hooks/useGuestSession";
import {
    JoinSpinSessionResponse,
    SpinSession,
    SpinSessionParticipant,
} from "@/app/(authenticated)/spin/shared/types";
import { routes } from "@/lib/routes";
import { isSpinSessionComplete } from "@/app/(authenticated)/spin/shared/session-lock";
import { Brand } from "@/components/layout/Brand";

/** Full-height centering for the single-panel states (loading, join, dead link). */
function CenteredScreen({ children }: { children: ReactNode }) {
    return (
        <Center mih="100dvh" p={24}>
            <Stack w="100%" maw={460} gap={20} align="center">
                {children}
            </Stack>
        </Center>
    );
}

/** The 460px "nothing to join here" panel: big gradient tile, title, body, actions. */
function NoticePanel({
    icon,
    gradient,
    shadow,
    title,
    body,
    caption,
    children,
}: {
    icon: ReactNode;
    gradient: { from: string; to: string; deg: number };
    shadow: string;
    title: string;
    body: string;
    caption?: string;
    children: ReactNode;
}) {
    return (
        <Paper
            w="100%"
            radius={28}
            pt={40}
            px={32}
            pb={32}
            style={{
                border: "1px solid var(--bd)",
                animation: "alm-in 500ms cubic-bezier(.2,.8,.2,1)",
            }}
        >
            <Stack align="center" gap={14} ta="center">
                <ThemeIcon
                    variant="gradient"
                    gradient={gradient}
                    size={80}
                    radius={24}
                    style={{ boxShadow: shadow, color: "#fff" }}
                >
                    {icon}
                </ThemeIcon>
                <Text fz={26} fw={700} lts="-0.035em" lh={1.15} mt={4}>
                    {title}
                </Text>
                <Text fz={14} c="var(--tx2)" lh={1.55}>
                    {body}
                </Text>
                <Stack w="100%" gap={8} mt={8}>
                    {children}
                </Stack>
                {caption && (
                    <Text fz={12} c="var(--tx3)">
                        {caption}
                    </Text>
                )}
            </Stack>
        </Paper>
    );
}

function LoadingScreen({ label }: { label: string }) {
    return (
        <CenteredScreen>
            <Stack align="center" gap={12} py={96} role="status">
                <Loader />
                <Text fz={13} c="var(--tx2)">
                    {label}
                </Text>
            </Stack>
        </CenteredScreen>
    );
}

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
            <CenteredScreen>
                <NoticePanel
                    icon={<Link2Off size={34} aria-hidden="true" />}
                    gradient={{ from: "rose", to: "amber", deg: 135 }}
                    shadow="0 16px 40px color-mix(in srgb, var(--ro) 30%, transparent)"
                    title="This invite link has expired"
                    body="The session may have ended, or the host started a new one. Ask them to send you a fresh link."
                    caption={routes.spinSession(sessionId)}
                >
                    <Button
                        component={Link}
                        href={routes.home()}
                        h={48}
                        radius={16}
                        fullWidth
                        fw={700}
                    >
                        Go to Alimenta
                    </Button>
                    <Button
                        component={Link}
                        href={routes.spinShared()}
                        variant="default"
                        h={48}
                        radius={16}
                        fullWidth
                    >
                        Start my own session
                    </Button>
                </NoticePanel>
            </CenteredScreen>
        );
    }

    if (isLoadingSession || isLoadingParticipant || !session) {
        return <LoadingScreen label="Loading session…" />;
    }

    // Redirecting to `/spin/shared` (see the effect above) — render its own
    // loading state rather than flashing the join form for an instant first.
    if (alreadyJoinedAsMember) {
        return <LoadingScreen label="Taking you to your session…" />;
    }

    /*
     * A winner was already picked before this visitor joined — the session is
     * read-only now, so there's nothing to join. Anyone already in the session
     * still gets the room below (it renders its own locked state).
     */
    if (!resolvedParticipant && isSpinSessionComplete(session)) {
        return (
            <CenteredScreen>
                <NoticePanel
                    icon={<PartyPopper size={34} aria-hidden="true" />}
                    gradient={{ from: "alimenta", to: "sky", deg: 135 }}
                    shadow="0 16px 40px rgba(59,214,146,0.35)"
                    title="This session has already finished"
                    body="The wheel has been spun and a winner picked, so the session is closed to new participants."
                >
                    <Button
                        component={Link}
                        href={routes.home()}
                        h={48}
                        radius={16}
                        fullWidth
                        fw={700}
                    >
                        Go to Alimenta
                    </Button>
                    <Button
                        component={Link}
                        href={routes.spinShared()}
                        variant="default"
                        h={48}
                        radius={16}
                        fullWidth
                    >
                        Start my own session
                    </Button>
                </NoticePanel>
            </CenteredScreen>
        );
    }

    /*
     * The visitor hasn't joined yet.
     */
    if (!resolvedParticipant) {
        return (
            <CenteredScreen>
                <Brand />
                <Box w="100%">
                    <JoinSpinSessionForm
                        session={session}
                        currentUser={profile}
                        onJoinedAction={handleParticipantJoined}
                    />
                </Box>
            </CenteredScreen>
        );
    }

    /*
     * Once joined, everyone gets essentially the same room.
     *
     * Account capabilities can be enabled based on `user`.
     */
    return (
        <Box maw={1040} mx="auto" pt={20} px={24} pb={40}>
            <ParticipantRoom
                session={session}
                participant={resolvedParticipant}
                onLeftAction={handleParticipantLeft}
            />
        </Box>
    );
}
