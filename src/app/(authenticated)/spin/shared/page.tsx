"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Dices,
    Link2,
    LogOut,
    PartyPopper,
    Trash2,
    UtensilsCrossed,
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Button,
    Card,
    CardContent,
} from "@/components/mantine/ui";
import { Tooltip } from "@mantine/core";
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
            <div className="flex items-center justify-center py-24">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="max-w-6xl mx-auto space-y-6">
                <p className="text-sm text-muted-foreground">
                    Create a session, invite friends, add meals, and spin to
                    decide what to eat.
                </p>

                <CreateSessionView
                    isCreatingSession={isCreatingSession}
                    onCreateSession={handleCreateSession}
                />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <p className="text-sm text-muted-foreground">
                Create a session, invite friends, add meals, and spin to decide
                what to eat.
            </p>

            {sessionLocked && (
                <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
                    <PartyPopper
                        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                        aria-hidden="true"
                    />
                    <div>
                        <p className="font-medium text-foreground">
                            {displayWinner
                                ? `${displayWinner.displayName}'s pick — ${displayWinner.foodName} — won the spin.`
                                : "A winner has been picked."}
                        </p>
                        <p className="text-muted-foreground">
                            This session is complete and now read-only.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                    <Card className="border-border/50 bg-card/60">
                        <CardContent className="p-5 flex flex-col items-center gap-4">
                            <SessionShareCard
                                sessionId={session.id}
                                isHost={isHost}
                            />

                            {isHost ? (
                                <div className="flex items-center gap-1.5 -mt-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 gap-1 text-muted-foreground hover:text-destructive"
                                        onClick={() =>
                                            setDeleteSessionDialogOpen(true)
                                        }
                                        aria-label="Delete session"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Delete session
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 -mt-2">
                                    <p className="text-xs text-muted-foreground">
                                        You&apos;re a participant in this
                                        session
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                        onClick={() => setLeaveDialogOpen(true)}
                                        aria-label="Leave session"
                                    >
                                        <LogOut className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            )}

                            <AlertDialog
                                open={leaveDialogOpen}
                                onOpenChangeAction={setLeaveDialogOpen}
                            >
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Leave this session?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            You&apos;ll be removed from the
                                            session and your food choice, if
                                            any, will be cleared. You can rejoin
                                            later with the same join link.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter
                                        style={{
                                            marginTop: "1.5rem",
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            gap: "0.5rem",
                                        }}
                                    >
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleConfirmLeaveSession}
                                        >
                                            Leave session
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog
                                open={deleteSessionDialogOpen}
                                onOpenChangeAction={setDeleteSessionDialogOpen}
                            >
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Delete this session?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This ends the session for everyone
                                            and can&apos;t be undone. All
                                            participants will be removed.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter
                                        style={{
                                            marginTop: "1.5rem",
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            gap: "0.5rem",
                                        }}
                                    >
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleConfirmDeleteSession}
                                        >
                                            Delete session
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            {hasEntries ? (
                                <MealSpinWheel
                                    segments={wheelSegments}
                                    spinTrigger={spinTrigger}
                                    onSpinRequest={requestSpin}
                                    canSpin={
                                        isHost && hasEntries && !sessionLocked
                                    }
                                    spinDisabledReason={spinDisabledReason}
                                />
                            ) : (
                                <>
                                    <div className="py-12 text-center space-y-2">
                                        <Dices className="h-12 w-12 mx-auto text-muted-foreground/40" />
                                        <p className="text-sm text-muted-foreground">
                                            Waiting for participants to add
                                            their meals…
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center gap-1.5 pb-2">
                                        <Tooltip
                                            label={spinDisabledReason ?? ""}
                                            disabled={!spinDisabledReason}
                                        >
                                            <Button
                                                disabled
                                                className="gap-2 min-w-30"
                                                aria-disabled
                                                aria-label={
                                                    spinDisabledReason ??
                                                    "Spin the wheel"
                                                }
                                            >
                                                <Dices className="h-4 w-4" />
                                                Spin!
                                            </Button>
                                        </Tooltip>
                                        <p className="text-xs text-muted-foreground">
                                            Only the host can spin the wheel.
                                        </p>
                                    </div>
                                </>
                            )}

                            {hasEntries && !sessionLocked && (
                                <p className="text-xs text-muted-foreground -mt-2 pb-1">
                                    Only the host can spin the wheel.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <WheelInstructions steps={INSTRUCTION_STEPS} />
                </div>

                <div className="space-y-4">
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
                        <>
                            <MealEntryForm
                                canAddMore={canAddMore}
                                onAdd={addFood}
                            />

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
                        </>
                    )}

                    <WheelSegments
                        segments={segmentRows}
                        onRemove={removeEntry}
                        onClearAll={clearAllEntries}
                        canClearAll={isHost && !sessionLocked}
                        emptyMessage="No meals added yet. Each participant adds one."
                    />
                </div>
            </div>

            <SpinWinnerDialog
                open={winnerDialogOpen}
                onOpenChangeAction={setWinnerDialogOpen}
                displayName={realtimeWinner?.displayName ?? ""}
                foodName={realtimeWinner?.foodName ?? ""}
            />
        </div>
    );
}
