"use client";

import { useEffect, useRef } from "react";
import { Box, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { ArrowDownToLine } from "lucide-react";
import type { PlannedMeal, PlannerSlot } from "@/core/types/models/planner";
import { DOW_SHORT, dowIndex, toDayKey, weekDays } from "@/lib/planner-dates";
import { BoardMealCard } from "./BoardMealCard";
import { ExpandedDay } from "./ExpandedDay";
import {
    SLOT_META,
    daySummary,
    dayTotals,
    formatKcal,
    kcalShares,
    missingSlots,
    sortBySlot,
    tint,
} from "./planner-meta";
import type { PlannerState } from "./usePlanner";

const COLUMN_MIN_HEIGHT = 640;

/**
 * One column per day of the selected week. Tapping a column selects the day,
 * which widens it in place into the full day editor.
 */
export function WeekBoard({
    planner,
    onAdd,
    onEdit,
}: {
    planner: PlannerState;
    onAdd: (date: string, slot: PlannerSlot) => void;
    onEdit: (meal: PlannedMeal) => void;
}) {
    const { today, selected, selectedDate } = planner;
    const days = weekDays(selectedDate);
    const boardRef = useRef<HTMLDivElement>(null);
    const selectedRef = useRef<HTMLDivElement>(null);

    // The board scrolls sideways on narrow screens; keep the open day in view.
    useEffect(() => {
        const board = boardRef.current;
        const column = selectedRef.current;
        if (!board || !column) return;
        const left = column.offsetLeft;
        const right = left + column.offsetWidth;
        if (left < board.scrollLeft) {
            board.scrollTo({ left, behavior: "smooth" });
        } else if (right > board.scrollLeft + board.clientWidth) {
            board.scrollTo({
                left: right - board.clientWidth,
                behavior: "smooth",
            });
        }
    }, [selected]);

    return (
        <Box
            ref={boardRef}
            pos="relative"
            pb="xs"
            style={{
                display: "grid",
                gridTemplateColumns: days
                    .map((day) =>
                        toDayKey(day) === selected
                            ? "minmax(320px, 2.8fr)"
                            : "minmax(118px, 1fr)"
                    )
                    .join(" "),
                gap: "var(--mantine-spacing-sm)",
                overflowX: "auto",
                scrollbarWidth: "thin",
                scrollbarColor: "var(--bd2) transparent",
            }}
        >
            {days.map((day) => {
                const key = toDayKey(day);
                const past = day < today;

                if (key === selected) {
                    return (
                        <Box
                            key={key}
                            ref={selectedRef}
                            aria-current="date"
                            p="sm"
                            mih={COLUMN_MIN_HEIGHT}
                            miw={0}
                            bg="var(--sf)"
                            opacity={past ? 0.8 : 1}
                            style={{
                                borderRadius: "var(--mantine-radius-xl)",
                                border: "1.5px solid var(--ac)",
                                boxShadow: "var(--sh)",
                            }}
                        >
                            <ExpandedDay
                                planner={planner}
                                onAdd={onAdd}
                                onEdit={onEdit}
                            />
                        </Box>
                    );
                }

                return (
                    <DayColumn
                        key={key}
                        planner={planner}
                        day={day}
                        past={past}
                        isToday={key === toDayKey(today)}
                    />
                );
            })}
        </Box>
    );
}

/** A day that isn't open: its meals, the slots still free and the totals. */
function DayColumn({
    planner,
    day,
    past,
    isToday,
}: {
    planner: PlannerState;
    day: Date;
    past: boolean;
    isToday: boolean;
}) {
    const key = toDayKey(day);
    const dow = DOW_SHORT[dowIndex(day)];
    const meals = sortBySlot(planner.plans[key] ?? []);
    const totals = dayTotals(meals, past);
    const { eatenPct, plannedPct } = kcalShares(totals);
    const summary = daySummary(meals, past);
    const missing = past || meals.length === 0 ? [] : missingSlots(meals);

    return (
        <Stack
            role="button"
            tabIndex={0}
            aria-label={`Select ${dow} ${day.getDate()}`}
            onClick={() => planner.select(key)}
            onKeyDown={(e) => {
                // Keys pressed on the buttons inside the column are theirs.
                if (e.target !== e.currentTarget) return;
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    planner.select(key);
                }
            }}
            gap="sm"
            p="sm"
            mih={COLUMN_MIN_HEIGHT}
            miw={0}
            bg="var(--sf)"
            opacity={past ? 0.8 : 1}
            style={{
                borderRadius: "var(--mantine-radius-xl)",
                border: "1px solid var(--bd)",
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
                        {dow}
                    </Text>
                </Group>
                {totals.total > 0 && (
                    <Text
                        fz="xxs"
                        c="var(--tx3)"
                        style={{
                            fontVariantNumeric: "tabular-nums",
                            whiteSpace: "nowrap",
                        }}
                        title={`${formatKcal(totals.total)} kcal estimated`}
                    >
                        {formatKcal(totals.total)}
                    </Text>
                )}
            </Group>

            <Box
                h={4}
                bg="var(--sf2)"
                style={{
                    display: "flex",
                    flexShrink: 0,
                    overflow: "hidden",
                    borderRadius: "var(--mantine-radius-pill)",
                }}
            >
                <Box w={`${eatenPct}%`} bg="var(--ac)" />
                <Box w={`${plannedPct}%`} bg={tint("var(--ac)", 35)} />
            </Box>

            {planner.picked && !past && (
                <UnstyledButton
                    onClick={(e) => {
                        e.stopPropagation();
                        planner.placePicked(key);
                    }}
                    h={34}
                    bg="var(--acs)"
                    c="var(--ac)"
                    fz="xs"
                    fw={700}
                    style={{
                        borderRadius: "var(--mantine-radius-xs)",
                        border: "1.5px dashed var(--ac)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "var(--mantine-spacing-xs)",
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                        animation: "alm-pulse 1.4s ease-in-out infinite",
                    }}
                >
                    <ArrowDownToLine size={14} />
                    Place
                </UnstyledButton>
            )}

            {meals.map((meal) => (
                <BoardMealCard
                    key={meal.id}
                    meal={meal}
                    past={past}
                    fresh={planner.freshIds.has(meal.id)}
                    onToggle={() => planner.toggleEaten(meal)}
                />
            ))}

            {missing.map((slot) => {
                const meta = SLOT_META[slot];
                const Icon = meta.icon;
                return (
                    <Group
                        key={slot}
                        gap="xs"
                        wrap="nowrap"
                        h={28}
                        px="sm"
                        c="var(--tx3)"
                        style={{
                            flexShrink: 0,
                            overflow: "hidden",
                            borderRadius: "var(--mantine-radius-xs)",
                            border: "1px dashed var(--bd)",
                        }}
                    >
                        <Icon
                            size={11}
                            color={meta.color}
                            opacity={0.7}
                            style={{ flexShrink: 0 }}
                        />
                        <Text fz="xxs" c="inherit" truncate>
                            No {meta.label.toLowerCase()} yet
                        </Text>
                    </Group>
                );
            })}

            {meals.length === 0 && (
                <Text fz="xs" c="var(--tx3)" px="xxs" py="xxs">
                    {past ? "Nothing logged" : "Free day"}
                </Text>
            )}

            <Stack
                gap="xxs"
                mt="auto"
                pt="sm"
                style={{
                    borderTop: "1px solid var(--bd)",
                    fontVariantNumeric: "tabular-nums",
                }}
            >
                <Text fz="xxs" fw={600} c="var(--tx2)" truncate>
                    {summary.main}
                </Text>
                <Text fz="xxs" c="var(--tx3)" truncate>
                    {summary.sub}
                </Text>
            </Stack>
        </Stack>
    );
}
