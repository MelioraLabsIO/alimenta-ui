"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Flex,
    Group,
    Modal,
    Paper,
    Stack,
    Text,
    ThemeIcon,
    Title,
} from "@mantine/core";
import { LogOut, PartyPopper, Utensils } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSessionStorage } from "@/hooks/useSessionStorage";
import type {
    SpinSession,
    SpinSessionParticipant,
    UpsertParticipantFoodParams,
} from "@/app/(authenticated)/spin/shared/types";
import {
    leaveSessionAsGuest,
    leaveSessionAsMember,
    upsertParticipantFoodAsGuest,
} from "@/apis/spin/mutations";
import { SessionShareCard } from "@/app/(authenticated)/spin/shared/components/SessionShareCard";
import {
    SessionParticipants,
    avatarGradient,
} from "@/app/(authenticated)/spin/shared/components/SessionParticipants";
import { WheelSegments } from "@/app/(authenticated)/spin/_components/WheelSegments";
import {
    MealSpinWheel,
    SPIN_DURATION_MS,
    WheelCard,
    WheelEmptyState,
    type SpinTrigger,
} from "@/app/(authenticated)/spin/_components/MealSpinWheel";
import { SpinWinnerDialog } from "@/app/(authenticated)/spin/_components/SpinWinnerDialog";
import { useSpinRealtime } from "@/app/(authenticated)/spin/shared/hooks/useSpinRealtime";
import { isSpinSessionComplete } from "@/app/(authenticated)/spin/shared/session-lock";
import {
    MAX_WHEEL_SEGMENTS,
    MealEntryForm,
} from "@/app/(authenticated)/spin/_components/MealEntryForm";
import { getInitialsFromName } from "@/lib/profile";
import { Brand } from "@/components/layout/Brand";

type Props = {
    session: SpinSession;
    participant: SpinSessionParticipant;
    /** Called after the current participant successfully removes themselves. */
    onLeftAction?: () => void;
};

/**
 * Room shown to a guest after joining a shared spin session via its join
 * link, identified entirely by the participant row's own
 * `id`/`participantToken` (never a Supabase session). A guest can never be
 * the session host — that requires an authenticated Alimenta member, who
 * gets their own room in the authenticated `Shared` view instead. Reuses the
 * same building blocks as that view — entry/spin mutations are still TODO
 * there too, so this stays display-only until those are wired to real
 * endpoints.
 */
export function ParticipantRoom({ session, participant, onLeftAction }: Props) {
    // The host manages their session from the authenticated `/spin/shared`
    // page, never from this join-by-code room — so a viewer here is always
    // a non-host, whether guest or authenticated member.
    const isMember = Boolean(participant.userId);

    const queryClient = useQueryClient();

    // Guests authenticate via a per-session token stashed in `sessionStorage`
    // on join (see `AnonymousJoinForm`).
    const [participantToken, setParticipantToken] = useSessionStorage(
        `spin:${session.id}:participant-token`
    );
    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
    const [winnerDialogOpen, setWinnerDialogOpen] = useState(false);
    // "Change" on the pick card re-opens the entry form for someone who
    // already picked.
    const [editingPick, setEditingPick] = useState(false);

    // Guests can't spin, but they watch the host's spin play out in realtime:
    // the backend broadcasts `spin.completed`, and everyone's wheel animates
    // to the same winner.
    const { winner: realtimeWinner, spinSeq } = useSpinRealtime(session.id);

    // The live event only exists for someone connected at spin time; on
    // reload (or a late join) the winner comes back from the session GET
    // response instead. Prefer the realtime one since it can't be stale.
    const displayWinner = realtimeWinner ?? session.winner ?? null;

    /********************************************* MUTATIONS ************************************************/
    // Guest self-removal: identified by their session-stored participant
    // token, so the backend only ever knows this as "remove me."
    const { mutate: removeSelfAsGuestMutation } = useMutation({
        mutationFn: () =>
            leaveSessionAsGuest(session.id, participantToken ?? ""),
        onSuccess: (deletedParticipant: Pick<SpinSessionParticipant, "id">) => {
            queryClient.setQueryData(["guest-session", session.id], null);

            if (deletedParticipant.id === participant.id) {
                setParticipantToken(null);
                onLeftAction?.();
            }
        },
    });

    // Authenticated-member self-removal, identified by Supabase session —
    // no participant ID needed.
    const { mutate: removeSelfAsMemberMutation } = useMutation({
        mutationFn: () => leaveSessionAsMember(session.id),
        onSuccess: () => {
            queryClient.setQueryData(["guest-session", session.id], null);
            onLeftAction?.();
        },
    });

    const { mutate: upsertFoodMutation } = useMutation({
        mutationFn: (foodName: string) => {
            const params: UpsertParticipantFoodParams = {
                foodName,
                id: participant.id,
                sessionId: session.id,
            };

            return upsertParticipantFoodAsGuest(
                session.id,
                params,
                participantToken ?? ""
            );
        },
        onSuccess: (updatedParticipant) => {
            queryClient.setQueryData(
                ["guest-session", session.id],
                (current: SpinSession | undefined) =>
                    current
                        ? {
                              ...current,
                              spinParticipants: current.spinParticipants.map(
                                  (p) =>
                                      p.id === updatedParticipant.id
                                          ? updatedParticipant
                                          : p
                              ),
                          }
                        : current
            );
        },
    });
    /********************************************* HANDLERS ************************************************/
    const handleConfirmLeaveSession = useCallback(() => {
        if (isMember) {
            removeSelfAsMemberMutation();
        } else {
            removeSelfAsGuestMutation();
        }
        setLeaveDialogOpen(false);
    }, [isMember, removeSelfAsMemberMutation, removeSelfAsGuestMutation]);

    const participants = session.spinParticipants ?? [];

    // Each participant carries at most one food choice — "entries" are
    // simply the participants who have set one. `foodName` is omitted
    // entirely by the backend until they pick, so guard with `?.`.
    const entries = participants.filter(
        (p): p is SpinSessionParticipant & { foodName: string } =>
            Boolean(p.foodName?.trim())
    );

    const wheelSegments = useMemo(
        () =>
            entries.map((entry) => ({
                id: entry.id,
                label: `${entry.displayName} — ${entry.foodName}`,
            })),
        [entries]
    );

    // Frozen the moment a winner is picked — via the persisted `status` on a
    // reload, or the live `spin.completed` event within the session.
    const sessionLocked = isSpinSessionComplete(
        session,
        Boolean(realtimeWinner)
    );

    // A guest can only ever remove their own entry — removing anyone else's,
    // and clearing the board, are host-only and the host is never in here.
    // Nobody removes anything once the session is locked.
    const segmentRows = entries.map((entry) => ({
        id: entry.id,
        label: entry.displayName,
        sublabel: entry.foodName,
        canRemove: !sessionLocked && entry.id === participant.id,
    }));

    const canAddMore = entries.length < MAX_WHEEL_SEGMENTS;
    const hasEntries = wheelSegments.length > 0;

    // Guests can never spin — only the session host can.
    const spinDisabledReason = sessionLocked
        ? "A winner has been picked — this session is complete"
        : "Only the host can spin the wheel";

    // Land the wheel on the participant the backend chose. `spinSeq` bumps
    // once per `spin.completed` event and drives the re-animation.
    const spinTrigger: SpinTrigger | null = useMemo(() => {
        if (!realtimeWinner || spinSeq === 0) return null;
        const winnerIndex = entries.findIndex(
            (entry) => entry.id === realtimeWinner.id
        );
        if (winnerIndex === -1) return null;
        return { seq: spinSeq, winnerIndex };
    }, [realtimeWinner, spinSeq, entries]);

    // Reveal the winner dialog once the wheel has come to rest.
    useEffect(() => {
        if (spinSeq === 0 || !realtimeWinner) return;
        const timer = setTimeout(
            () => setWinnerDialogOpen(true),
            SPIN_DURATION_MS + 150
        );
        return () => clearTimeout(timer);
    }, [spinSeq, realtimeWinner]);

    const handleAddEntry = useCallback(
        (label: string) => {
            upsertFoodMutation(label);
            setEditingPick(false);
        },
        [upsertFoodMutation]
    );

    // TODO: wire these to real mutations once the backend endpoints exist —
    // the authenticated Shared view (useSharedSession.ts) has the same gap.
    const handleRemoveEntry: (entryId: string) => void = () => {};
    const handleClearAllEntries: () => void = () => {};
    const handleRequestSpin: () => void = () => {};

    // Who this viewer is in the live list (their pick lives there once set),
    // and who's hosting — the host is the participant whose user ID matches.
    const participantIndex = participants.findIndex(
        (p) => p.id === participant.id
    );
    const me = participants[participantIndex] ?? participant;
    const myPick = me.foodName?.trim() || "";
    const host = participants.find(
        (p) => p.userId !== "" && p.userId === session.hostUserId
    );
    const hostName = host?.displayName ?? "the host";

    const heading = sessionLocked
        ? "The wheel has spoken."
        : myPick
          ? `You're in. Waiting for ${hostName} to spin.`
          : "You're in. Add your pick.";

    const showEntryForm = !sessionLocked && (!myPick || editingPick);

    return (
        <Stack gap={16}>
            {/* Guests get no app chrome — the (session) layout is a bare
                <main> — so the room carries its own brand row. */}
            <Group gap={10} align="center" wrap="nowrap">
                <Brand />
                <Group
                    ml="auto"
                    gap={8}
                    align="center"
                    wrap="nowrap"
                    h={36}
                    px={5}
                    fz={13}
                    bg="var(--glass)"
                    style={{
                        borderRadius: 999,
                        border: "1px solid var(--bd)",
                        backdropFilter: "blur(20px)",
                        whiteSpace: "nowrap",
                    }}
                >
                    <Avatar
                        size={26}
                        fz={11}
                        gradient={avatarGradient(
                            participantIndex === -1 ? 1 : participantIndex
                        )}
                    >
                        {getInitialsFromName(participant.displayName)}
                    </Avatar>
                    <Text fz={13} visibleFrom="xs">
                        Joined as{" "}
                        <Text component="span" fw={700}>
                            {participant.displayName}
                        </Text>
                    </Text>
                    <Button
                        variant="surface"
                        size="xs"
                        h={26}
                        px={10}
                        c="var(--tx2)"
                        onClick={() => setLeaveDialogOpen(true)}
                        aria-label="Leave session"
                    >
                        Leave
                    </Button>
                </Group>
            </Group>

            <Box>
                <Text fz={13} c="var(--tx2)">
                    Shared session · hosted by {hostName}
                </Text>
                <Title order={1} fz={32} mt={2}>
                    {heading}
                </Title>
            </Box>

            {sessionLocked && (
                <Paper
                    radius={18}
                    px={18}
                    py={14}
                    shadow="none"
                    bg="var(--acs)"
                    style={{
                        border: "1px solid color-mix(in srgb, var(--ac) 35%, transparent)",
                    }}
                >
                    <Group gap={12} align="center" wrap="nowrap">
                        <PartyPopper
                            size={18}
                            color="var(--ac)"
                            aria-hidden="true"
                            style={{ flexShrink: 0 }}
                        />
                        <Box flex={1} miw={0}>
                            <Text component="span" fw={700}>
                                {displayWinner
                                    ? `${displayWinner.displayName}'s pick, ${displayWinner.foodName}, won the spin.`
                                    : "A winner has been picked."}
                            </Text>
                            <Text component="span" c="var(--tx2)" ml={6}>
                                This session is now read-only.
                            </Text>
                        </Box>
                    </Group>
                </Paper>
            )}

            <Flex wrap="wrap" gap={12} align="flex-start">
                <Box style={{ flex: "7 1 420px", minWidth: 0 }}>
                    <WheelCard>
                        {hasEntries ? (
                            <MealSpinWheel
                                segments={wheelSegments}
                                spinTrigger={spinTrigger}
                                onSpinRequest={handleRequestSpin}
                                canSpin={false}
                                spinDisabledReason={spinDisabledReason}
                                showSpinButton={false}
                                muted
                            />
                        ) : (
                            <WheelEmptyState
                                title="Nothing on the wheel yet"
                                description="Waiting for participants to add their meals…"
                            />
                        )}

                        <Group
                            gap={12}
                            align="center"
                            wrap="nowrap"
                            h={52}
                            px={22}
                            bg="var(--sf2)"
                            c="var(--tx2)"
                            fw={600}
                            fz={14}
                            maw="100%"
                            style={{ borderRadius: 999 }}
                            aria-label={spinDisabledReason}
                        >
                            {!sessionLocked && (
                                <Group gap={4} wrap="nowrap">
                                    {[0, 150, 300].map((delay) => (
                                        <Box
                                            key={delay}
                                            w={7}
                                            h={7}
                                            bg="var(--ac)"
                                            style={{
                                                borderRadius: 999,
                                                animation:
                                                    "alm-bounce 1.2s ease-in-out infinite",
                                                animationDelay: `${delay}ms`,
                                            }}
                                        />
                                    ))}
                                </Group>
                            )}
                            <Text fz={14} fw={600} truncate>
                                {sessionLocked
                                    ? "This session is complete"
                                    : `${hostName} will spin once everyone's in`}
                            </Text>
                        </Group>
                    </WheelCard>
                </Box>

                <Stack gap={12} style={{ flex: "5 1 320px", minWidth: 0 }}>
                    <Box
                        p={1.5}
                        style={{
                            borderRadius: 24,
                            background: "var(--gradient-accent)",
                            boxShadow: "var(--sh)",
                        }}
                    >
                        <Paper radius={22.5} p={18} shadow="none">
                            <Group gap={14} align="center" wrap="nowrap">
                                <ThemeIcon size={44} radius={14}>
                                    <Utensils size={19} />
                                </ThemeIcon>
                                <Box flex={1} miw={0}>
                                    <Text fz={12} c="var(--tx3)">
                                        Your pick
                                    </Text>
                                    <Text
                                        fw={700}
                                        fz={18}
                                        lts="-0.02em"
                                        c={myPick ? undefined : "var(--tx3)"}
                                        truncate
                                    >
                                        {myPick || "Not picked yet"}
                                    </Text>
                                </Box>
                                {!sessionLocked && myPick && (
                                    <Button
                                        variant="default"
                                        size="xs"
                                        h={34}
                                        px={14}
                                        onClick={() =>
                                            setEditingPick((v) => !v)
                                        }
                                    >
                                        {editingPick ? "Keep it" : "Change"}
                                    </Button>
                                )}
                            </Group>
                        </Paper>
                    </Box>

                    {/* No adding a meal once a winner is picked. */}
                    {showEntryForm && (
                        <MealEntryForm
                            canAddMore={canAddMore}
                            onAdd={handleAddEntry}
                            title={
                                myPick ? "Change your pick" : "Add your pick"
                            }
                        />
                    )}

                    <SessionParticipants
                        participants={participants}
                        hostUserId={session.hostUserId}
                    />

                    <WheelSegments
                        segments={segmentRows}
                        onRemove={handleRemoveEntry}
                        onClearAll={handleClearAllEntries}
                        canClearAll={false}
                        emptyMessage="No meals added yet. Each participant adds one."
                    />

                    <SessionShareCard session={session} isHost={false} />
                </Stack>
            </Flex>

            <Modal
                opened={leaveDialogOpen}
                onClose={() => setLeaveDialogOpen(false)}
                title="Leave this session?"
                size={420}
            >
                <Text fz={14} c="var(--tx2)">
                    You&apos;ll be removed from the session and your food
                    choice, if any, will be cleared. You can rejoin later with
                    the same join link.
                </Text>
                <Group justify="flex-end" gap={8} mt={24}>
                    <Button
                        variant="default"
                        onClick={() => setLeaveDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        leftSection={<LogOut size={15} />}
                        onClick={handleConfirmLeaveSession}
                    >
                        Leave session
                    </Button>
                </Group>
            </Modal>

            <SpinWinnerDialog
                open={winnerDialogOpen}
                onOpenChangeAction={setWinnerDialogOpen}
                displayName={realtimeWinner?.displayName ?? ""}
                foodName={realtimeWinner?.foodName ?? ""}
            />
        </Stack>
    );
}
