"use client";

import { useCallback, useMemo } from "react";
import { Dices } from "lucide-react";
import { Button, Card, CardContent } from "@/components/mantine/ui";
import { Tooltip } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    MealSpinWheel,
    type SpinTrigger,
} from "@/app/(app)/spin/widgets/MealSpinWheel";
import {
    MAX_WHEEL_SEGMENTS,
    MealEntryForm,
} from "@/app/(app)/spin/_components/MealEntryForm";
import { PastMealsSearch } from "@/app/(app)/spin/_components/PastMealsSearch";
import { createSpinSession } from "@/apis/spin/mutations";

import { useSharedSession } from "./useSharedSession";
import { CreateSessionView } from "./components/CreateSessionView";
import { SessionShareCard } from "./components/SessionShareCard";
import { SessionParticipants } from "./components/SessionParticipants";
import { SharedWheelSegments } from "./components/SharedWheelSegments";
import { SessionInstructions } from "./components/SessionInstructions";
import { useAuthUserStore } from "@/stores/auth-user.store";

export function Shared() {
    const queryClient = useQueryClient();

    const { user } = useAuthUserStore();
    const {
        session,
        isHost,
        isLoading,
        error,
        currentUserId,
        addEntry,
        removeEntry,
        clearAllEntries,
        requestSpin,
    } = useSharedSession(user);

    const {
        mutate: createSpinSessionMutation,
        isPending: isCreatingSession,
        data: createdSession,
    } = useMutation({
        mutationKey: ["createSpinSession"],
        mutationFn: createSpinSession,
        onSuccess: (createdSession) => {
            queryClient.setQueryData(["session"], createdSession);
        },
    });

    const onCreateSession = useCallback(() => {
        createSpinSessionMutation();
    }, [createSpinSessionMutation]);

    const entries = useMemo(() => session?.entries ?? [], [session?.entries]);
    const participants = useMemo(
        () => session?.spinParticipants ?? [],
        [session?.spinParticipants]
    );

    const wheelSegments = useMemo(
        () =>
            entries.map((entry) => ({
                id: entry.id,
                label: `${entry.participantName} — ${entry.food}`,
            })),
        [entries]
    );

    const spinTrigger: SpinTrigger | null = null;

    const canAddMore = entries.length < MAX_WHEEL_SEGMENTS;
    const addedLabels = entries
        .filter((e) => e.participantId === user?.id)
        .map((e) => e.food);

    const hasEntries = wheelSegments.length > 0;
    const spinDisabledReason = !isHost
        ? "Only the host can spin the wheel"
        : !hasEntries
          ? "Add meals before spinning"
          : undefined;

    const shareJoinUrl = createdSession?.joinURL;

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
                onCreateSession={onCreateSession}
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
                                code={session.code}
                                joinUrl={shareJoinUrl}
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

                    <SessionInstructions />
                </div>

                <div className="space-y-4">
                    <SessionParticipants
                        participants={participants}
                        isLoading={isLoading}
                        error={error}
                    />

                    <MealEntryForm canAddMore={canAddMore} onAdd={addEntry} />

                    <PastMealsSearch
                        addedLabels={addedLabels}
                        canAddMore={canAddMore}
                        onAdd={addEntry}
                        onRemoveByLabel={(label) => {
                            const entry = entries.find(
                                (e) =>
                                    e.participantId === currentUserId &&
                                    e.food.toLowerCase() === label.toLowerCase()
                            );
                            if (entry) removeEntry(entry.id);
                        }}
                    />

                    <SharedWheelSegments
                        entries={entries}
                        currentUserId={currentUserId}
                        isHost={isHost}
                        onRemove={removeEntry}
                        onClearAll={clearAllEntries}
                    />
                </div>
            </div>
        </div>
    );
}
