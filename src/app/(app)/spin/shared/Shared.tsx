"use client";

import { useMemo } from "react";
import { Dices } from "lucide-react";
import { Button, Card, CardContent } from "@/components/mantine/ui";
import { Tooltip } from "@mantine/core";

import {
    MealSpinWheel,
    type SpinTrigger,
} from "@/app/(app)/spin/widgets/MealSpinWheel";
import {
    MAX_WHEEL_SEGMENTS,
    MealEntryForm,
} from "@/app/(app)/spin/_components/MealEntryForm";
import { PastMealsSearch } from "@/app/(app)/spin/_components/PastMealsSearch";

import { useSharedSession } from "./useSharedSession";
import { SessionShareCard } from "./components/SessionShareCard";
import { SessionParticipants } from "./components/SessionParticipants";
import { SharedWheelSegments } from "./components/SharedWheelSegments";
import { SessionInstructions } from "./components/SessionInstructions";
import type { UseSharedSessionReturn } from "./types";

type ExtendedSession = UseSharedSessionReturn & { _spinSeq: number };

/**
 * Authenticated shared spin-wheel mode.
 *
 * Layout (desktop): left column = wheel + session info, right column = panels.
 * State is owned by `useSharedSession`; this component is pure composition.
 */
export function Shared() {
    const {
        session,
        isLoading,
        error,
        currentUserId,
        isHost,
        addEntry,
        removeEntry,
        clearAllEntries,
        requestSpin,
        _spinSeq,
    } = useSharedSession() as ExtendedSession;

    const entries = useMemo(() => session?.entries ?? [], [session?.entries]);
    const participants = useMemo(
        () => session?.participants ?? [],
        [session?.participants]
    );

    // Map SharedEntry[] → WheelSegment[] using stable IDs.
    const wheelSegments = useMemo(
        () =>
            entries.map((entry) => ({
                id: entry.id,
                label: `${entry.participantName} — ${entry.food}`,
            })),
        [entries]
    );

    // Derive the winner's index from the backend-provided winnerId.
    const winnerId = session?.winnerId ?? null;
    const spinTrigger = useMemo((): SpinTrigger | null => {
        if (!winnerId) return null;
        const winnerIndex = entries.findIndex((e) => e.id === winnerId);
        if (winnerIndex === -1) return null;
        return { seq: _spinSeq, winnerIndex };
    }, [winnerId, entries, _spinSeq]);

    const canAddMore = entries.length < MAX_WHEEL_SEGMENTS;
    const addedLabels = entries
        .filter((e) => e.participantId === currentUserId)
        .map((e) => e.food);

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

    if (error || !session) {
        return (
            <p className="text-sm text-destructive py-8 text-center">
                {error ?? "Failed to load session."}
            </p>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* ── Left column: wheel + session info ── */}
                <div className="space-y-4">
                    <Card className="border-border/50 bg-card/60">
                        <CardContent className="p-5 flex flex-col items-center gap-4">
                            {/* Session code + QR */}
                            <SessionShareCard
                                code={session.code}
                                isHost={isHost}
                            />

                            {/* Wheel (or empty state) */}
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

                            {/* Helper text below the built-in spin button */}
                            {hasEntries && (
                                <p className="text-xs text-muted-foreground -mt-2 pb-1">
                                    Only the host can spin the wheel.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* How it works */}
                    <SessionInstructions />
                </div>

                {/* ── Right column: session panels ── */}
                <div className="space-y-4">
                    <SessionParticipants
                        participants={participants}
                        isLoading={isLoading}
                        error={error}
                    />

                    <MealEntryForm canAddMore={canAddMore} onAdd={addEntry} />

                    {/* Past meals: always shown for authenticated users */}
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
