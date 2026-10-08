"use client";

import { useState } from "react";
import { Flex, Stack } from "@mantine/core";
import { Dices, Trophy, UtensilsCrossed } from "lucide-react";
import {
    WheelInstructions,
    type WheelInstructionStep,
} from "@/app/(authenticated)/spin/_components/WheelInstructions";
import {
    MAX_WHEEL_SEGMENTS,
    MealEntryForm,
} from "@/app/(authenticated)/spin/_components/MealEntryForm";
import { PastMealsSearch } from "@/app/(authenticated)/spin/_components/PastMealsSearch";
import { WheelSegments } from "@/app/(authenticated)/spin/_components/WheelSegments";
import {
    MealSpinWheel,
    WheelCard,
    WheelEmptyState,
    type WheelSegment,
} from "@/app/(authenticated)/spin/_components/MealSpinWheel";

const INSTRUCTION_STEPS: WheelInstructionStep[] = [
    {
        icon: UtensilsCrossed,
        title: "1. Add your meals",
        description: "Search your past meals or type any meal name.",
    },
    {
        icon: Dices,
        title: "2. Spin to decide",
        description: "Give it a spin once a few options are on the wheel.",
    },
    {
        icon: Trophy,
        title: "3. Eat the winner",
        description: "The wheel picks, so you don't have to.",
    },
];

export default function Personal() {
    const [segments, setSegments] = useState<WheelSegment[]>([]);

    const canAddMore = segments.length < MAX_WHEEL_SEGMENTS;
    const addedLabels = segments.map((s) => s.label);

    function addSegment(label: string) {
        const trimmed = label.trim();
        if (!trimmed) return;
        if (segments.length >= MAX_WHEEL_SEGMENTS) return;
        if (
            segments.some(
                (s) => s.label.toLowerCase() === trimmed.toLowerCase()
            )
        )
            return;
        const id = Math.random().toString(36).slice(2, 10);
        setSegments((prev) => [...prev, { label: trimmed, id }]);
    }

    function removeSegmentById(id: string) {
        setSegments((prev) => prev.filter((s) => s.id !== id));
    }

    function removeSegmentByLabel(label: string) {
        setSegments((prev) =>
            prev.filter((s) => s.label.toLowerCase() !== label.toLowerCase())
        );
    }

    const segmentRows = segments.map((s) => ({
        id: s.id ?? s.label,
        label: s.label,
        canRemove: true,
    }));

    return (
        <Flex wrap="wrap" gap="md" align="flex-start">
            {/* Wheel */}
            <Stack gap="md" style={{ flex: "7 1 440px", minWidth: 0 }}>
                <WheelCard>
                    {segments.length === 0 ? (
                        <WheelEmptyState
                            title="Your wheel is empty"
                            description="Add at least two meals on the right to spin."
                        />
                    ) : (
                        <MealSpinWheel segments={segments} />
                    )}
                </WheelCard>

                <WheelInstructions steps={INSTRUCTION_STEPS} />
            </Stack>

            {/* Controls */}
            <Stack gap="md" style={{ flex: "5 1 360px", minWidth: 0 }}>
                <MealEntryForm canAddMore={canAddMore} onAdd={addSegment}>
                    <PastMealsSearch
                        addedLabels={addedLabels}
                        canAddMore={canAddMore}
                        onAdd={addSegment}
                        onRemoveByLabel={removeSegmentByLabel}
                    />
                </MealEntryForm>
                <WheelSegments
                    segments={segmentRows}
                    onRemove={removeSegmentById}
                    onClearAll={() => setSegments([])}
                    canClearAll={true}
                    emptyMessage="No meals yet. Add one above to build your wheel."
                />
            </Stack>
        </Flex>
    );
}
