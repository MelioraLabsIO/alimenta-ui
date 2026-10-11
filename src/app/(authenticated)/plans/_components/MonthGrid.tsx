"use client";

import { Box, Group, Paper, Text, UnstyledButton } from "@mantine/core";
import { Check } from "lucide-react";
import { PLANNER_SLOTS, type PlannedMeal } from "@/core/types/models/planner";
import { DOW_SHORT, monthGridDays, toDayKey } from "@/lib/planner-dates";
import {
    SLOT_META,
    dayTotals,
    formatKcal,
    mealState,
    tint,
} from "./planner-meta";
import type { PlannerState } from "./usePlanner";

const MAX_CHIPS = 4;

/** Month calendar with each day's meal names. Tapping a day selects it. */
export function MonthGrid({ planner }: { planner: PlannerState }) {
    const { today, selected, selectedDate, plans } = planner;
    const month = selectedDate.getMonth();

    return (
        <Paper
            radius="xl"
            p="md"
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                gap: "var(--mantine-spacing-xs)",
            }}
        >
            {DOW_SHORT.map((dow) => (
                <Text
                    key={dow}
                    fz="xxs"
                    fw={600}
                    c="var(--tx3)"
                    tt="uppercase"
                    lts="var(--ls-wide)"
                    px="xs"
                    pb="xxs"
                >
                    {dow}
                </Text>
            ))}

            {monthGridDays(selectedDate).map((day) => {
                const key = toDayKey(day);
                const past = day < today;
                const isToday = key === toDayKey(today);
                const isSelected = key === selected;
                const meals = [...(plans[key] ?? [])].sort(
                    (a, b) =>
                        PLANNER_SLOTS.indexOf(a.slot) -
                        PLANNER_SLOTS.indexOf(b.slot)
                );
                const { total } = dayTotals(meals, past);
                const extra = meals.length - MAX_CHIPS;

                return (
                    <UnstyledButton
                        key={key}
                        onClick={() => planner.select(key)}
                        aria-current={isSelected ? "date" : undefined}
                        mih={118}
                        miw={0}
                        p="xs"
                        bg="var(--sf2)"
                        opacity={day.getMonth() === month ? 1 : 0.35}
                        style={{
                            borderRadius: "var(--mantine-radius-sm)",
                            border: isSelected
                                ? "1.5px solid var(--ac)"
                                : "1px solid transparent",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "stretch",
                            gap: "var(--mantine-spacing-xxs)",
                        }}
                    >
                        <Group
                            justify="space-between"
                            gap="xxs"
                            wrap="nowrap"
                            px="xxs"
                        >
                            <Text
                                fz="xs"
                                fw={700}
                                c={isToday ? "var(--ac)" : "var(--tx)"}
                            >
                                {day.getDate()}
                            </Text>
                            {total > 0 && (
                                <Text
                                    fz="xxs"
                                    c="var(--tx3)"
                                    style={{
                                        fontVariantNumeric: "tabular-nums",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {formatKcal(total)} kcal
                                </Text>
                            )}
                        </Group>
                        {meals.slice(0, MAX_CHIPS).map((meal) => (
                            <MealChip key={meal.id} meal={meal} past={past} />
                        ))}
                        {extra > 0 && (
                            <Text fz="xxs" c="var(--tx3)" pl="xxs">
                                +{extra} more
                            </Text>
                        )}
                    </UnstyledButton>
                );
            })}
        </Paper>
    );
}

function MealChip({ meal, past }: { meal: PlannedMeal; past: boolean }) {
    const meta = SLOT_META[meal.slot];
    const state = mealState(meal, past);
    const border =
        state === "eaten"
            ? `1px solid ${tint(meta.color, 28)}`
            : state === "missed"
              ? "1px dashed var(--bd2)"
              : `1px dashed ${tint(meta.color, 60)}`;

    return (
        <Box
            h={20}
            miw={0}
            bg="var(--sf)"
            opacity={state === "missed" ? 0.55 : 1}
            style={{
                display: "flex",
                alignItems: "center",
                borderRadius: "var(--mantine-radius-xs)",
                overflow: "hidden",
                border,
            }}
        >
            <Box
                w={3}
                style={{
                    alignSelf: "stretch",
                    flexShrink: 0,
                    background:
                        state === "eaten"
                            ? meta.color
                            : `repeating-linear-gradient(180deg, ${meta.color} 0 4px, transparent 4px 8px)`,
                }}
            />
            <Text
                fz="xxs"
                fw={500}
                px="xs"
                truncate
                miw={0}
                style={{ flex: 1 }}
            >
                {meal.name}
            </Text>
            {state === "eaten" && (
                <Check
                    size={10}
                    color={meta.color}
                    style={{
                        marginRight: "var(--mantine-spacing-xs)",
                        flexShrink: 0,
                    }}
                />
            )}
        </Box>
    );
}
