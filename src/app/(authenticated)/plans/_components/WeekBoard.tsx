"use client";

import { Box, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { ArrowDownToLine } from "lucide-react";
import { PLANNER_SLOTS } from "@/core/types/models/planner";
import { DOW_SHORT, dowIndex, toDayKey, weekDays } from "@/lib/planner-dates";
import { BoardMealCard } from "./BoardMealCard";
import { dayTotals, formatKcal } from "./planner-meta";
import type { PlannerState } from "./usePlanner";

/** One column per day of the selected week. Tapping a column selects the day. */
export function WeekBoard({ planner }: { planner: PlannerState }) {
    const { today, selected, selectedDate, plans, picked, freshIds } = planner;

    return (
        <Box
            pb="xs"
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, minmax(112px, 1fr))",
                gap: "var(--mantine-spacing-sm)",
                overflowX: "auto",
                scrollbarWidth: "thin",
                scrollbarColor: "var(--bd2) transparent",
            }}
        >
            {weekDays(selectedDate).map((day) => {
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

                return (
                    <Stack
                        key={key}
                        role="button"
                        tabIndex={0}
                        aria-label={`Select ${DOW_SHORT[dowIndex(day)]} ${day.getDate()}`}
                        aria-current={isSelected ? "date" : undefined}
                        onClick={() => planner.select(key)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                planner.select(key);
                            }
                        }}
                        gap="sm"
                        p="sm"
                        mih={440}
                        bg="var(--sf)"
                        opacity={past ? 0.8 : 1}
                        style={{
                            borderRadius: "var(--mantine-radius-xl)",
                            border: isSelected
                                ? "1.5px solid var(--ac)"
                                : "1px solid var(--bd)",
                            boxShadow: "var(--sh)",
                            cursor: "pointer",
                            transition: "border-color 150ms",
                        }}
                    >
                        <Group
                            justify="space-between"
                            align="baseline"
                            gap="xs"
                            wrap="nowrap"
                            px="xxs"
                            pt="xxs"
                            pb="xs"
                            style={{ borderBottom: "1px solid var(--bd)" }}
                        >
                            <Group gap="xs" align="baseline" wrap="nowrap">
                                <Text
                                    fz="xxl"
                                    fw={700}
                                    lts="var(--ls-tight)"
                                    c={isToday ? "var(--ac)" : "var(--tx)"}
                                >
                                    {day.getDate()}
                                </Text>
                                <Text fz="xs" fw={600} c="var(--tx3)">
                                    {DOW_SHORT[dowIndex(day)]}
                                </Text>
                            </Group>
                            {total > 0 && (
                                <Text
                                    fz="xxs"
                                    c="var(--tx3)"
                                    style={{
                                        fontVariantNumeric: "tabular-nums",
                                        whiteSpace: "nowrap",
                                    }}
                                    title={`${formatKcal(total)} kcal estimated`}
                                >
                                    {formatKcal(total)}
                                </Text>
                            )}
                        </Group>

                        {picked && !past && (
                            <UnstyledButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    planner.placePicked(key);
                                }}
                                h={46}
                                bg="var(--acs)"
                                c="var(--ac)"
                                fz="xs"
                                fw={700}
                                style={{
                                    borderRadius: "var(--mantine-radius-sm)",
                                    border: "1.5px dashed var(--ac)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "var(--mantine-spacing-xs)",
                                    animation:
                                        "alm-pulse 1.4s ease-in-out infinite",
                                }}
                            >
                                <ArrowDownToLine size={14} />
                                Place here
                            </UnstyledButton>
                        )}

                        {meals.map((meal) => (
                            <BoardMealCard
                                key={meal.id}
                                meal={meal}
                                past={past}
                                fresh={freshIds.has(meal.id)}
                                onToggle={() => planner.toggleEaten(meal)}
                            />
                        ))}

                        {meals.length === 0 && (
                            <Text
                                fz="xs"
                                c="var(--tx3)"
                                ta="center"
                                px="sm"
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {past ? "Nothing logged" : "Free day"}
                            </Text>
                        )}
                    </Stack>
                );
            })}
        </Box>
    );
}
