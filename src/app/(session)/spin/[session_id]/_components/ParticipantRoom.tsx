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
    deleteSpinParticipantAsGuest,
    deleteSpinParticipantAsMember,
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
 * Room shown to a participant after joining a shared spin session via its
 * join code — either a guest, identified entirely by the participant row's
 * own `id`/`participantToken` (never a Supabase session), or an
 * authenticated Alimenta member, identified by their Supabase session (no
 * participant token). Reuses the same building blocks as the authenticated
 * `Shared` view — entry/spin mutations are still TODO there too, so this
 * stays display-only until those are wired to real endpoints.
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

    /********************************************* MUTATIONS ************************************************/
    // Guest self-removal: identified by their session-stored participant
    // token, so the backend only ever knows this as "remove me."
    const { mutate: removeSelfAsGuestMutation } = useMutation({
        mutationFn: () =>
            deleteSpinParticipantAsGuest(session.id, participantToken ?? ""),
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
        mutationFn: () => deleteSpinParticipantAsMember(session.id),
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

    const canAddMore = entries.length < MAX_WHEEL_SEGMENTS;
    const hasEntries = wheelSegments.length > 0;

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
                                sessionCode={session.id}
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
