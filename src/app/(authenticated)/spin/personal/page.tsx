"use client";

import { useState } from "react";
import { Dices, Trophy, UtensilsCrossed } from "lucide-react";
import { Card, CardContent } from "@/components/mantine/ui";
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
    WheelSegment,
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
        <div className="max-w-6xl mx-auto space-y-6">
            <p className="text-sm text-muted-foreground">
                Build your wheel, then spin to decide what to eat.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Wheel */}
                <div className="space-y-4">
                    <Card className="border-border/50 bg-card/60">
                        <CardContent className="p-5 flex flex-col items-center gap-4">
                            {segments.length === 0 ? (
                                <div className="py-12 text-center space-y-2">
                                    <Dices className="h-12 w-12 mx-auto text-muted-foreground/40" />
                                    <p className="text-sm text-muted-foreground">
                                        Add meals on the right to start
                                        spinning.
                                    </p>
                                </div>
                            ) : (
                                <MealSpinWheel segments={segments} />
                            )}
                        </CardContent>
                    </Card>

                    <WheelInstructions steps={INSTRUCTION_STEPS} />
                </div>

                {/* Controls */}
                <div className="space-y-4">
                    <MealEntryForm canAddMore={canAddMore} onAdd={addSegment} />
                    <PastMealsSearch
                        addedLabels={addedLabels}
                        canAddMore={canAddMore}
                        onAdd={addSegment}
                        onRemoveByLabel={removeSegmentByLabel}
                    />
                    <WheelSegments
                        segments={segmentRows}
                        onRemove={removeSegmentById}
                        onClearAll={() => setSegments([])}
                        canClearAll={true}
                        emptyMessage="No meals yet. Add one above to build your wheel."
                    />
                </div>
            </div>
        </div>
    );
}
