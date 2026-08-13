"use client";

import { useCallback, useMemo } from "react";
import { Dices } from "lucide-react";
import { Button, Card, CardContent } from "@/components/mantine/ui";
import { Tooltip } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    createSpinSession,
    deleteSpinParticipantAsMember,
} from "@/apis/spin/mutations";

import { useSharedSession } from "./useSharedSession";
import type { SpinSessionParticipant } from "./types";
import { CreateSessionView } from "./components/CreateSessionView";
import { SessionShareCard } from "./components/SessionShareCard";
import { SessionParticipants } from "./components/SessionParticipants";
import { SharedWheelSegments } from "./components/SharedWheelSegments";
import { SessionInstructions } from "./components/SessionInstructions";
import { useAuthUserStore } from "@/stores/auth-user.store";
import {
    MealSpinWheel,
    SpinTrigger,
} from "@/app/(authenticated)/spin/_components/MealSpinWheel";
import {
    MAX_WHEEL_SEGMENTS,
    MealEntryForm,
} from "@/app/(authenticated)/spin/_components/MealEntryForm";
import { PastMealsSearch } from "@/app/(authenticated)/spin/_components/PastMealsSearch";

export function Shared() {
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

    /********************************************* MUTATIONS ************************************************/
    const { mutate: createSpinSessionMutation, isPending: isCreatingSession } =
        useMutation({
            mutationKey: ["createSpinSession"],
            mutationFn: () => createSpinSession(),
            onSuccess: (createdSession) => {
                queryClient.setQueryData(["session"], createdSession);
            },
        });

    const { mutate: removeParticipantMutation } = useMutation({
        mutationFn: (participantId: string) =>
            deleteSpinParticipantAsMember(session!.sessionCode, participantId),
        onSuccess: (_, participantId) => {
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
        },
    });

    /********************************************* HANDLERS ************************************************/
    const handleRemoveParticipant = useCallback(
        (participantId: string) => removeParticipantMutation(participantId),
        [removeParticipantMutation]
    );

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

    const spinTrigger: SpinTrigger | null = null;

    const canAddMore = entries.length < MAX_WHEEL_SEGMENTS;
    const addedLabels = entries
        .filter((p) => p.id === currentParticipantId)
        .map((p) => p.foodName);

    const hasEntries = wheelSegments.length > 0;
    const spinDisabledReason = !isHost
        ? "Only the host can spin the wheel"
        : !hasEntries
          ? "Add meals before spinning"
          : undefined;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
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
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                    <Card className="border-border/50 bg-card/60">
                        <CardContent className="p-5 flex flex-col items-center gap-4">
                            <SessionShareCard
                                sessionCode={session.sessionCode}
                                isHost={isHost}
                            />

                            {hasEntries ? (
                                <MealSpinWheel
                                    segments={wheelSegments}
                                    spinTrigger={spinTrigger}
                                    onSpinRequest={requestSpin}
                                    canSpin={isHost && hasEntries}
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

                            {hasEntries && (
                                <p className="text-xs text-muted-foreground -mt-2 pb-1">
                                    Only the host can spin the wheel.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <SessionInstructions isHost={isHost} />
                </div>

                <div className="space-y-4">
                    <SessionParticipants
                        participants={participants}
                        hostUserId={session.hostUserId}
                        isHost={isHost}
                        onRemoveParticipant={handleRemoveParticipant}
                        isLoading={isLoading}
                        error={error}
                    />

                    <MealEntryForm canAddMore={canAddMore} onAdd={addFood} />

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

                    <SharedWheelSegments
                        participants={entries}
                        currentParticipantId={currentParticipantId}
                        isHost={isHost}
                        onRemove={removeEntry}
                        onClearAll={clearAllEntries}
                    />
                </div>
            </div>
        </div>
    );
}
