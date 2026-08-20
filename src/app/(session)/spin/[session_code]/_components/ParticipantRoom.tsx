"use client";

import { useCallback, useMemo, useState } from "react";
import { Dices, LogOut } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useSessionStorage } from "@/hooks/useSessionStorage";
import type {
    SpinSession,
    SpinSessionParticipant,
    UpsertParticipantFoodParams,
} from "@/app/(authenticated)/spin/shared/types";
import {
    leaveSessionAsGuest,
    upsertParticipantFoodAsGuest,
} from "@/apis/spin/mutations";
import { SessionShareCard } from "@/app/(authenticated)/spin/shared/components/SessionShareCard";
import { SessionParticipants } from "@/app/(authenticated)/spin/shared/components/SessionParticipants";
import { SharedWheelSegments } from "@/app/(authenticated)/spin/shared/components/SharedWheelSegments";
import { MealSpinWheel } from "@/app/(authenticated)/spin/_components/MealSpinWheel";
import {
    MAX_WHEEL_SEGMENTS,
    MealEntryForm,
} from "@/app/(authenticated)/spin/_components/MealEntryForm";

type Props = {
    session: SpinSession;
    participant: SpinSessionParticipant;
    /** Called after the current participant successfully removes themselves. */
    onLeftAction?: () => void;
};

/**
 * Room shown to a guest after joining a shared spin session via its join
 * code, identified entirely by the participant row's own
 * `id`/`participantToken` (never a Supabase session). A guest can never be
 * the session host — that requires an authenticated Alimenta member, who
 * gets their own room in the authenticated `Shared` view instead. Reuses the
 * same building blocks as that view — entry/spin mutations are still TODO
 * there too, so this stays display-only until those are wired to real
 * endpoints.
 */
export function ParticipantRoom({ session, participant, onLeftAction }: Props) {
    const queryClient = useQueryClient();

    // Guests authenticate via a per-session token stashed in `sessionStorage`
    // on join (see `AnonymousJoinForm`).
    const [participantToken, setParticipantToken] = useSessionStorage(
        `spin:${session.sessionCode}:participant-token`
    );
    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

    /********************************************* MUTATIONS ************************************************/
    // Guest self-removal: identified by their session-stored participant
    // token, so the backend only ever knows this as "remove me."
    const { mutate: removeSelfAsGuestMutation } = useMutation({
        mutationFn: () =>
            leaveSessionAsGuest(session.id, participantToken ?? ""),
        onSuccess: (deletedParticipant: Pick<SpinSessionParticipant, "id">) => {
            queryClient.setQueryData(
                ["guest-session", session.sessionCode],
                null
            );

            if (deletedParticipant.id === participant.id) {
                setParticipantToken(null);
                onLeftAction?.();
            }
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
                ["guest-session", session.sessionCode],
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
        removeSelfAsGuestMutation();
        setLeaveDialogOpen(false);
    }, [removeSelfAsGuestMutation]);

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

    const canAddMore = entries.length < MAX_WHEEL_SEGMENTS;
    const hasEntries = wheelSegments.length > 0;
    // Guests can never spin — only the session host can.
    const spinDisabledReason = "Only the host can spin the wheel";

    const handleAddEntry = useCallback(
        (label: string) => upsertFoodMutation(label),
        [upsertFoodMutation]
    );

    // TODO: wire these to real mutations once the backend endpoints exist —
    // the authenticated Shared view (useSharedSession.ts) has the same gap.
    const handleRemoveEntry: (entryId: string) => void = () => {};
    const handleClearAllEntries: () => void = () => {};
    const handleRequestSpin: () => void = () => {};

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                    <Card className="border-border/50 bg-card/60">
                        <CardContent className="p-5 flex flex-col items-center gap-4">
                            <SessionShareCard
                                sessionCode={session.sessionCode}
                                isHost={false}
                            />

                            <div className="flex items-center gap-1.5">
                                <p className="text-xs text-muted-foreground">
                                    Joined as{" "}
                                    <span className="font-medium text-foreground">
                                        {participant.displayName}
                                    </span>
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

                            <AlertDialog
                                open={leaveDialogOpen}
                                onOpenChange={setLeaveDialogOpen}
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
                                            later with the session code.
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

                            {hasEntries ? (
                                <MealSpinWheel
                                    segments={wheelSegments}
                                    onSpinRequest={handleRequestSpin}
                                    canSpin={false}
                                    spinDisabledReason={spinDisabledReason}
                                />
                            ) : (
                                <div className="py-12 text-center space-y-2">
                                    <Dices className="h-12 w-12 mx-auto text-muted-foreground/40" />
                                    <p className="text-sm text-muted-foreground">
                                        Waiting for participants to add their
                                        meals…
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <SessionParticipants
                        participants={participants}
                        hostUserId={session.hostUserId}
                    />

                    <MealEntryForm
                        canAddMore={canAddMore}
                        onAdd={handleAddEntry}
                    />

                    <SharedWheelSegments
                        participants={entries}
                        currentParticipantId={participant.id}
                        isHost={false}
                        onRemove={handleRemoveEntry}
                        onClearAll={handleClearAllEntries}
                    />
                </div>
            </div>
        </div>
    );
}
