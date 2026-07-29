"use client";

import { useState } from "react";
import { Dices } from "lucide-react";
import { Card, CardContent } from "@/components/mantine/ui";
import {
    MealSpinWheel,
    WheelSegment,
} from "@/app/(app)/spin/widgets/MealSpinWheel";
import { MealEntryForm, MAX_WHEEL_SEGMENTS } from "@/app/(app)/spin/_components/MealEntryForm";
import { PastMealsSearch } from "@/app/(app)/spin/_components/PastMealsSearch";
import { WheelSegments } from "@/app/(app)/spin/_components/WheelSegments";

export function Personal() {
    const [segments, setSegments] = useState<WheelSegment[]>([]);

    const canAddMore = segments.length < MAX_WHEEL_SEGMENTS;
    const addedLabels = segments.map((s) => s.label);

    function addSegment(label: string) {
        const trimmed = label.trim();
        if (!trimmed) return;
        if (segments.length >= MAX_WHEEL_SEGMENTS) return;
        if (segments.some((s) => s.label.toLowerCase() === trimmed.toLowerCase()))
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Wheel */}
                <Card className="border-border/50 bg-card/60">
                    <CardContent className="p-6 flex flex-col items-center">
                        {segments.length === 0 ? (
                            <div className="py-16 text-center space-y-2">
                                <Dices className="h-12 w-12 mx-auto text-muted-foreground/40" />
                                <p className="text-sm text-muted-foreground">
                                    Add meals on the right to start spinning.
                                </p>
                            </div>
                        ) : (
                            <MealSpinWheel segments={segments} />
                        )}
                    </CardContent>
                </Card>

                {/* Controls */}
                <div className="space-y-4">
                    <MealEntryForm
                        canAddMore={canAddMore}
                        onAdd={addSegment}
                    />
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
                    />
                </div>
            </div>
        </div>
    );
}

