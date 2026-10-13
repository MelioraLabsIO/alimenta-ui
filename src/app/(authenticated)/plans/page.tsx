"use client";

import { useState } from "react";
import { Box, Flex, Group, Skeleton, Stack } from "@mantine/core";
import type { PlannedMeal, PlannerSlot } from "@/core/types/models/planner";
import { DayPanel } from "./_components/DayPanel";
import { MealTray } from "./_components/MealTray";
import { MonthGrid } from "./_components/MonthGrid";
import {
    PlannedMealModal,
    type MealEditorTarget,
} from "./_components/PlannedMealModal";
import { PlannerToolbar } from "./_components/PlannerToolbar";
import { usePlanner, type PlannerState } from "./_components/usePlanner";
import { WeekBoard } from "./_components/WeekBoard";

export default function PlannerPage() {
    const planner = usePlanner();
    const [editor, setEditor] = useState<MealEditorTarget | null>(null);

    const onAdd = (date: string, slot: PlannerSlot) =>
        setEditor({ mode: "add", date, slot });
    const onEdit = (meal: PlannedMeal) => setEditor({ mode: "edit", meal });

    if (!planner.ready) return <PlannerSkeleton />;

    return (
        <Stack gap="md">
            <PlannerToolbar planner={planner} />
            <MealTray planner={planner} />

            {planner.view === "week" ? (
                <WeekBoard planner={planner} onAdd={onAdd} onEdit={onEdit} />
            ) : (
                <MonthView planner={planner} onAdd={onAdd} onEdit={onEdit} />
            )}

            <PlannedMealModal
                target={editor}
                onClose={() => setEditor(null)}
                onSubmit={(target, draft) =>
                    target.mode === "edit"
                        ? planner.editMeal(target.meal, draft)
                        : planner.addMeal(draft)
                }
            />
        </Stack>
    );
}

type DayEditorProps = {
    planner: PlannerState;
    onAdd: (date: string, slot: PlannerSlot) => void;
    onEdit: (meal: PlannedMeal) => void;
};

/** Month calendar with the selected day's detail beside it. */
function MonthView({ planner, onAdd, onEdit }: DayEditorProps) {
    return (
        <Flex
            gap="md"
            align="flex-start"
            direction={{ base: "column", lg: "row" }}
        >
            <Box miw={0} w="100%" style={{ flex: 1 }}>
                <MonthGrid planner={planner} />
            </Box>
            <DayPanel planner={planner} onAdd={onAdd} onEdit={onEdit} />
        </Flex>
    );
}

function PlannerSkeleton() {
    return (
        <Stack gap="md">
            <Group gap="sm">
                <Skeleton h={32} w={160} radius="xs" />
                <Skeleton h={32} w={120} radius="xs" />
            </Group>
            <Skeleton h={128} radius="xl" />
            <Skeleton h={640} radius="xl" />
        </Stack>
    );
}
