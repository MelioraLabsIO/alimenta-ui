"use client";

import { useState } from "react";
import { Box, Flex, Group, Skeleton, Stack } from "@mantine/core";
import { DayPanel } from "./_components/DayPanel";
import { MealTray } from "./_components/MealTray";
import { MonthGrid } from "./_components/MonthGrid";
import {
    PlannedMealModal,
    type MealEditorTarget,
} from "./_components/PlannedMealModal";
import { PlannerToolbar } from "./_components/PlannerToolbar";
import { usePlanner } from "./_components/usePlanner";
import { WeekBoard } from "./_components/WeekBoard";

export default function PlannerPage() {
    const planner = usePlanner();
    const [editor, setEditor] = useState<MealEditorTarget | null>(null);

    if (!planner.ready) return <PlannerSkeleton />;

    return (
        <Stack gap="md">
            <PlannerToolbar planner={planner} />
            <MealTray planner={planner} />

            <Flex
                gap="md"
                align="flex-start"
                direction={{ base: "column", lg: "row" }}
            >
                <Box miw={0} w="100%" style={{ flex: 1 }}>
                    {planner.view === "week" ? (
                        <WeekBoard planner={planner} />
                    ) : (
                        <MonthGrid planner={planner} />
                    )}
                </Box>
                <DayPanel
                    planner={planner}
                    onAdd={(date, slot) =>
                        setEditor({ mode: "add", date, slot })
                    }
                    onEdit={(meal) => setEditor({ mode: "edit", meal })}
                />
            </Flex>

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

function PlannerSkeleton() {
    return (
        <Stack gap="md">
            <Group gap="sm">
                <Skeleton h={32} w={160} radius="xs" />
                <Skeleton h={32} w={120} radius="xs" />
            </Group>
            <Skeleton h={128} radius="xl" />
            <Flex gap="md" direction={{ base: "column", lg: "row" }}>
                <Skeleton h={440} radius="xl" style={{ flex: 1 }} />
                <Skeleton h={440} w={{ base: "100%", lg: 280 }} radius="xl" />
            </Flex>
        </Stack>
    );
}
