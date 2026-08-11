"use client";

import { useMemo } from "react";
import { Dices } from "lucide-react";
import { Card, CardContent } from "@/components/mantine/ui";
import type {
    SpinSession,
    SpinSessionParticipant,
} from "@/app/(authenticated)/spin/shared/types";
import type { getUserProfile } from "@/apis/profile/queries";
import { SessionShareCard } from "@/app/(authenticated)/spin/shared/components/SessionShareCard";
import { SessionParticipants } from "@/app/(authenticated)/spin/shared/components/SessionParticipants";
import { SessionInstructions } from "@/app/(authenticated)/spin/shared/components/SessionInstructions";
import { SharedWheelSegments } from "@/app/(authenticated)/spin/shared/components/SharedWheelSegments";
import { MealSpinWheel } from "@/app/(authenticated)/spin/_components/MealSpinWheel";
import {
    MAX_WHEEL_SEGMENTS,
    MealEntryForm,
} from "@/app/(authenticated)/spin/_components/MealEntryForm";
import { PastMealsSearch } from "@/app/(authenticated)/spin/_components/PastMealsSearch";

type Props = {
    session: SpinSession;
    participant: SpinSessionParticipant;
    authenticatedUser: Awaited<ReturnType<typeof getUserProfile>> | null;
};

/**
 * Room shown to a participant (guest or authenticated) after joining a
 * shared spin session. Reuses the same building blocks as the authenticated
 * `Shared` view — entry/spin mutations are still TODO there too, so this
 * stays display-only until those are wired to real endpoints.
 */
export function ParticipantRoom({
    session,
    participant,
    authenticatedUser,
}: Props) {
    const isHost = authenticatedUser?.id === session.hostUserId;

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
    const spinDisabledReason = !isHost
        ? "Only the host can spin the wheel"
        : !hasEntries
          ? "Add meals before spinning"
          : undefined;

    // `participant.userId` is empty for guests — use the participant row's
    // own `id` to identify "my" entry instead.
    const addedLabels = entries
        .filter((entry) => entry.id === participant.id)
        .map((entry) => entry.foodName);

    // TODO: wire these to real mutations once the backend endpoints exist —
    // the authenticated Shared view (useSharedSession.ts) has the same gap.
    const handleAddEntry: (label: string) => void = () => {};
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
                                code={session.joinCode}
                                isHost={isHost}
                            />

                            <p className="text-xs text-muted-foreground">
                                Joined as{" "}
                                <span className="font-medium text-foreground">
                                    {participant.displayName}
                                </span>
                            </p>

                            {hasEntries ? (
                                <MealSpinWheel
                                    segments={wheelSegments}
                                    onSpinRequest={handleRequestSpin}
                                    canSpin={isHost && hasEntries}
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

                    <SessionInstructions />
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

                    {authenticatedUser && (
                        <PastMealsSearch
                            addedLabels={addedLabels}
                            canAddMore={canAddMore}
                            onAdd={handleAddEntry}
                            onRemoveByLabel={(label) => {
                                const entry = entries.find(
                                    (e) =>
                                        e.id === participant.id &&
                                        e.foodName.toLowerCase() ===
                                            label.toLowerCase()
                                );
                                if (entry) handleRemoveEntry(entry.id);
                            }}
                        />
                    )}

                    <SharedWheelSegments
                        participants={entries}
                        currentParticipantId={participant.id}
                        isHost={isHost}
                        onRemove={handleRemoveEntry}
                        onClearAll={handleClearAllEntries}
                    />
                </div>
            </div>
        </div>
    );
}
