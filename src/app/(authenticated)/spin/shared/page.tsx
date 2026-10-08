"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Center,
    Flex,
    Group,
    Loader,
    Modal,
    Paper,
    Stack,
    Text,
    Tooltip,
} from "@mantine/core";
import {
    Dices,
    Link2,
    LogOut,
    PartyPopper,
    RotateCcw,
    UtensilsCrossed,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    createSpinSession,
    deleteSpinParticipant,
    deleteSpinSession,
    leaveSessionAsMember,
} from "@/apis/spin/mutations";

import { useSharedSession } from "./hooks/useSharedSession";
import type { SpinSessionParticipant } from "./types";
import { CreateSessionView } from "./components/CreateSessionView";
import { SessionShareCard } from "./components/SessionShareCard";
import { SessionParticipants } from "./components/SessionParticipants";
import { WheelSegments } from "@/app/(authenticated)/spin/_components/WheelSegments";
import {
    WheelInstructions,
    type WheelInstructionStep,
} from "@/app/(authenticated)/spin/_components/WheelInstructions";
import { useAuthUserStore } from "@/stores/auth-user.store";
import {
    MealSpinWheel,
    SPIN_DURATION_MS,
    SpinTrigger,
    WheelCard,
    WheelEmptyState,
} from "@/app/(authenticated)/spin/_components/MealSpinWheel";
import { SpinWinnerDialog } from "@/app/(authenticated)/spin/_components/SpinWinnerDialog";
import { isSpinSessionComplete } from "@/app/(authenticated)/spin/shared/session-lock";
import {
    MAX_WHEEL_SEGMENTS,
    MealEntryForm,
} from "@/app/(authenticated)/spin/_components/MealEntryForm";
import { PastMealsSearch } from "@/app/(authenticated)/spin/_components/PastMealsSearch";
import { useSpinRealtime } from "@/app/(authenticated)/spin/shared/hooks/useSpinRealtime";

const INSTRUCTION_STEPS: WheelInstructionStep[] = [
    {
        icon: Link2,
        title: "1. Share the link",
        description: "Invite others to join using the join link or QR.",
    },
    {
        icon: UtensilsCrossed,
        title: "2. Add your meal",
        description: "Everyone adds one meal they're in the mood for.",
    },
    {
        icon: Dices,
        title: "3. Spin to decide",
        description: "The host spins and we all eat the winner!",
    },
];

export default function Shared() {
    const queryClient = useQueryClient();

    const { user } = useAuthUserStore();
    const {
        session,
        isHost,
        isLoading,
        error,
        currentParticipantId,
        addFood,
        removeEntry,
        clearAllEntries,
        requestSpin,
    } = useSharedSession(user);

    const { winner: realtimeWinner, spinSeq } = useSpinRealtime(session?.id);

    // The live event only exists for someone connected at spin time; on
    // reload (or a late join) the winner comes back from the session GET
    // response instead. Prefer the realtime one since it can't be stale.
    const displayWinner = realtimeWinner ?? session?.winner ?? null;

    // Frozen the moment a winner is picked — via the persisted `status` on a
    // reload, or the live `spin.completed` event within the session. No
    // joining, food edits, participant removal, or re-spinning past this.
    const sessionLocked = isSpinSessionComplete(
        session,
        Boolean(realtimeWinner)
    );

    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
    const [deleteSessionDialogOpen, setDeleteSessionDialogOpen] =
        useState(false);
    const [winnerDialogOpen, setWinnerDialogOpen] = useState(false);

    /********************************************* MUTATIONS ************************************************/
    const { mutate: createSpinSessionMutation, isPending: isCreatingSession } =
        useMutation({
            mutationKey: ["createSpinSession"],
            mutationFn: () => createSpinSession(),
            onSuccess: (createdSession) => {
                queryClient.setQueryData(["session"], createdSession);
            },
        });

    // Non-host member leaving on their own — the host can't leave this way,
    // they have to delete the session instead (see deleteSessionMutation).
    const { mutate: leaveSessionMutation } = useMutation({
        mutationFn: () => leaveSessionAsMember(session!.id),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["session"] });
            const previousSession = queryClient.getQueryData<typeof session>([
                "session",
            ]);
            queryClient.setQueryData(["session"], null);
            return { previousSession };
        },
        onError: (_err, _vars, context) => {
            queryClient.setQueryData(["session"], context?.previousSession);
        },
    });

    // Host removing another participant by ID.
    const { mutate: removeParticipantMutation } = useMutation({
        mutationFn: (participantId: string) =>
            deleteSpinParticipant(session!.id, participantId),
        onMutate: async (participantId) => {
            await queryClient.cancelQueries({ queryKey: ["session"] });
            const previousSession = queryClient.getQueryData<typeof session>([
                "session",
            ]);
            queryClient.setQueryData(["session"], (current: typeof session) =>
                current
                    ? {
                          ...current,
                          spinParticipants: current.spinParticipants.filter(
                              (p) => p.id !== participantId
                          ),
                      }
                    : current
            );
            return { previousSession };
        },
        onError: (_err, _participantId, context) => {
            queryClient.setQueryData(["session"], context?.previousSession);
        },
    });

    // Host deleting the whole session.
    const { mutate: deleteSessionMutation } = useMutation({
        mutationKey: ["deleteSpinSession"],
        mutationFn: () => deleteSpinSession(session!.id),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["session"] });
            const previousSession = queryClient.getQueryData<typeof session>([
                "session",
            ]);
            queryClient.setQueryData(["session"], null);
            return { previousSession };
        },
        onError: (_err, _vars, context) => {
            queryClient.setQueryData(["session"], context?.previousSession);
        },
    });

    /********************************************* HANDLERS ************************************************/
    const handleRemoveParticipant = useCallback(
        (participantId: string) => removeParticipantMutation(participantId),
        [removeParticipantMutation]
    );

    const handleConfirmLeaveSession = useCallback(() => {
        leaveSessionMutation();
        setLeaveDialogOpen(false);
    }, [leaveSessionMutation]);

    const handleConfirmDeleteSession = useCallback(() => {
        deleteSessionMutation();
        setDeleteSessionDialogOpen(false);
    }, [deleteSessionMutation]);

    const handleCreateSession = useCallback(() => {
        createSpinSessionMutation();
    }, [createSpinSessionMutation]);

    const participants = useMemo(
        () => session?.spinParticipants ?? [],
        [session?.spinParticipants]
    );

    // Each participant carries at most one food choice — "entries" are
    // simply the participants who have set one. `foodName` is omitted
    // entirely by the backend until they pick, so guard with `?.`.
    const entries = useMemo(
        () =>
            participants.filter(
                (p): p is SpinSessionParticipant & { foodName: string } =>
                    Boolean(p.foodName?.trim())
            ),
        [participants]
    );

    const wheelSegments = useMemo(
        () =>
            entries.map((entry) => ({
                id: entry.id,
                label: `${entry.displayName} — ${entry.foodName}`,
            })),
        [entries]
    );

    // The segments card shows the name and the meal in separate columns, and
    // lets you remove an entry if it's yours (or if you're the host) — never
    // once the session is locked.
    const segmentRows = useMemo(
        () =>
            entries.map((entry) => ({
                id: entry.id,
                label: entry.displayName,
                sublabel: entry.foodName,
                canRemove:
                    !sessionLocked &&
                    (isHost || entry.id === currentParticipantId),
            })),
        [entries, isHost, currentParticipantId, sessionLocked]
    );

    // Translate the realtime winner into the index the wheel needs to land
    // on. `spinSeq` (bumped once per `spin.completed` event) is what makes the
    // wheel re-animate, so it drives the `seq`.
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

    const canAddMore = entries.length < MAX_WHEEL_SEGMENTS;
    const addedLabels = entries
        .filter((p) => p.id === currentParticipantId)
        .map((p) => p.foodName);

    const hasEntries = wheelSegments.length > 0;

    let spinDisabledReason: string | undefined;
    if (sessionLocked) {
        spinDisabledReason =
            "A winner has been picked — this session is complete";
    } else if (!isHost) {
        spinDisabledReason = "Only the host can spin the wheel";
    } else if (!hasEntries) {
        spinDisabledReason = "Add meals before spinning";
    }

    if (isLoading) {
        return (
            <Center py={96}>
                <Loader />
            </Center>
        );
    }

    if (!session) {
        return (
            <CreateSessionView
                isCreatingSession={isCreatingSession}
                onCreateSession={handleCreateSession}
            />
        );
    }

    return (
        <Stack gap="md">
            {sessionLocked && (
                <Paper
                    radius="lg"
                    px="lg"
                    py="md"
                    shadow="none"
                    bg="var(--acs)"
                    style={{
                        border: "1px solid color-mix(in srgb, var(--ac) 35%, transparent)",
                    }}
                >
                    <Group gap="md" align="center" wrap="nowrap">
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
                            <Text component="span" c="var(--tx2)" ml="xs">
                                This session is now read-only.
                            </Text>
                        </Box>
                        {isHost ? (
                            <Button
                                size="sm"
                                h={40}
                                px="lg"
                                leftSection={<RotateCcw size={15} />}
                                onClick={() => setDeleteSessionDialogOpen(true)}
                                style={{ flexShrink: 0 }}
                            >
                                Start a new session
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                h={40}
                                px="lg"
                                variant="default"
                                leftSection={<LogOut size={15} />}
                                onClick={() => setLeaveDialogOpen(true)}
                                style={{ flexShrink: 0 }}
                            >
                                Leave session
                            </Button>
                        )}
                    </Group>
                </Paper>
            )}

            <Flex wrap="wrap" gap="md" align="flex-start">
                <Stack gap="md" style={{ flex: "7 1 440px", minWidth: 0 }}>
                    <WheelCard>
                        {hasEntries ? (
                            <MealSpinWheel
                                segments={wheelSegments}
                                spinTrigger={spinTrigger}
                                onSpinRequest={requestSpin}
                                canSpin={isHost && hasEntries && !sessionLocked}
                                spinDisabledReason={spinDisabledReason}
                            />
                        ) : (
                            <>
                                <WheelEmptyState
                                    title="Your wheel is empty"
                                    description="Waiting for participants to add their meals…"
                                />
                                <Tooltip
                                    label={spinDisabledReason ?? ""}
                                    disabled={!spinDisabledReason}
                                >
                                    <Button
                                        disabled
                                        variant="gradient"
                                        size="xl"
                                        miw={200}
                                        fw={700}
                                        leftSection={<Dices size={19} />}
                                        aria-disabled
                                        aria-label={
                                            spinDisabledReason ??
                                            "Spin the wheel"
                                        }
                                    >
                                        Spin!
                                    </Button>
                                </Tooltip>
                            </>
                        )}

                        {!sessionLocked && (
                            <Text fz="xs" c="var(--tx3)" mt={-10}>
                                Only the host can spin.
                                {isHost ? " That's you." : ""}
                            </Text>
                        )}
                    </WheelCard>

                    <WheelInstructions steps={INSTRUCTION_STEPS} />
                </Stack>

                <Stack gap="md" style={{ flex: "5 1 360px", minWidth: 0 }}>
                    <SessionShareCard
                        session={session}
                        isHost={isHost}
                        onEndSession={() => setDeleteSessionDialogOpen(true)}
                        onLeave={() => setLeaveDialogOpen(true)}
                    />

                    <SessionParticipants
                        participants={participants}
                        hostUserId={session.hostUserId}
                        // Host can remove participants — but not after the
                        // session is locked.
                        isHost={isHost && !sessionLocked}
                        onRemoveParticipant={handleRemoveParticipant}
                        isLoading={isLoading}
                        error={error}
                    />

                    {/* Adding meals is gone entirely once a winner is picked. */}
                    {!sessionLocked && (
                        <MealEntryForm
                            canAddMore={canAddMore}
                            onAdd={addFood}
                            title="Your pick"
                        >
                            <PastMealsSearch
                                addedLabels={addedLabels}
                                canAddMore={canAddMore}
                                onAdd={addFood}
                                onRemoveByLabel={(label) => {
                                    const entry = entries.find(
                                        (p) =>
                                            p.id === currentParticipantId &&
                                            p.foodName.toLowerCase() ===
                                                label.toLowerCase()
                                    );
                                    if (entry) removeEntry(entry.id);
                                }}
                            />
                        </MealEntryForm>
                    )}

                    <WheelSegments
                        segments={segmentRows}
                        onRemove={removeEntry}
                        onClearAll={clearAllEntries}
                        canClearAll={isHost && !sessionLocked}
                        emptyMessage="No meals added yet. Each participant adds one."
                    />
                </Stack>
            </Flex>

            <Modal
                opened={leaveDialogOpen}
                onClose={() => setLeaveDialogOpen(false)}
                title="Leave this session?"
                size={420}
            >
                <Text fz="md" c="var(--tx2)">
                    You&apos;ll be removed from the session and your food
                    choice, if any, will be cleared. You can rejoin later with
                    the same join link.
                </Text>
                <Group justify="flex-end" gap="sm" mt="xl">
                    <Button
                        variant="default"
                        onClick={() => setLeaveDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmLeaveSession}>
                        Leave session
                    </Button>
                </Group>
            </Modal>

            <Modal
                opened={deleteSessionDialogOpen}
                onClose={() => setDeleteSessionDialogOpen(false)}
                title="End this session?"
                size={420}
            >
                <Text fz="md" c="var(--tx2)">
                    This ends the session for everyone and can&apos;t be undone.
                    All participants will be removed.
                </Text>
                <Group justify="flex-end" gap="sm" mt="xl">
                    <Button
                        variant="default"
                        onClick={() => setDeleteSessionDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button color="rose" onClick={handleConfirmDeleteSession}>
                        End session
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
