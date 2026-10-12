"use client";

import {
    ActionIcon,
    Box,
    Button,
    Group,
    Paper,
    Stack,
    Text,
    UnstyledButton,
} from "@mantine/core";
import { CalendarRange, Pencil, Plus, X } from "lucide-react";
import {
    PLANNER_SLOTS,
    type PlannedMeal,
    type PlannerSlot,
} from "@/core/types/models/planner";
import {
    formatDayTitle,
    formatRelativeDay,
    weekDays,
    toDayKey,
} from "@/lib/planner-dates";
import { EatenToggle } from "./EatenToggle";
import {
    DAILY_KCAL_TARGET,
    SLOT_META,
    STATE_LABEL,
    dayTotals,
    formatKcal,
    mealState,
    tint,
} from "./planner-meta";
import type { PlannerState } from "./usePlanner";

/**
 * The selected day: calorie bar against the target, each meal slot with its
 * meals (tick, edit, remove) and a one-line summary of the week.
 */
export function DayPanel({
    planner,
    onAdd,
    onEdit,
}: {
    planner: PlannerState;
    onAdd: (date: string, slot: PlannerSlot) => void;
    onEdit: (meal: PlannedMeal) => void;
}) {
    const { today, selected, selectedDate, plans, picked, view, freshIds } =
        planner;
    const past = selectedDate < today;
    const meals = plans[selected] ?? [];
    const totals = dayTotals(meals, past);
    const eatenPct = Math.min(100, (totals.eaten / DAILY_KCAL_TARGET) * 100);
    const plannedPct = Math.min(
        100 - eatenPct,
        (totals.planned / DAILY_KCAL_TARGET) * 100
    );

    const week = weekDays(selectedDate).flatMap((d) =>
        (plans[toDayKey(d)] ?? []).map((m) => mealState(m, d < today))
    );
    const count = (s: string) => week.filter((x) => x === s).length;

    return (
        <Paper
            radius="xl"
            p="lg"
            w={{ base: "100%", lg: 280 }}
            style={{ flexShrink: 0 }}
        >
            <Stack gap="md">
                <Group align="flex-start" gap="sm" wrap="nowrap">
                    <Box style={{ flex: 1 }} miw={0}>
                        <Text fz="xs" c="var(--tx3)">
                            {formatRelativeDay(selectedDate, today)}
                        </Text>
                        <Text fz="xxl" fw={700} lts="var(--ls-snug)">
                            {formatDayTitle(selectedDate)}
                        </Text>
                    </Box>
                    {picked && !past && (
                        <UnstyledButton
                            onClick={() => planner.placePicked(selected)}
                            h={32}
                            px="md"
                            bg="var(--acs)"
                            c="var(--ac)"
                            fz="xs"
                            fw={700}
                            style={{
                                borderRadius: "var(--mantine-radius-xs)",
                                border: "1.5px dashed var(--ac)",
                                display: "flex",
                                alignItems: "center",
                                gap: "var(--mantine-spacing-xs)",
                                whiteSpace: "nowrap",
                                animation:
                                    "alm-pulse 1.4s ease-in-out infinite",
                            }}
                        >
                            <Plus size={13} />
                            Place here
                        </UnstyledButton>
                    )}
                </Group>

                <Stack gap="xs">
                    <Box
                        h={10}
                        bg="var(--sf2)"
                        style={{
                            display: "flex",
                            overflow: "hidden",
                            borderRadius: "var(--mantine-radius-pill)",
                        }}
                    >
                        <Box
                            w={`${eatenPct}%`}
                            bg="var(--ac)"
                            style={{ transition: "width 400ms" }}
                        />
                        <Box
                            w={`${plannedPct}%`}
                            style={{
                                background:
                                    "repeating-linear-gradient(45deg, var(--acs) 0 4px, transparent 4px 8px)",
                                border: plannedPct ? "1px dashed var(--ac)" : 0,
                                borderLeft: 0,
                                borderRadius: "0 999px 999px 0",
                                transition: "width 400ms",
                            }}
                        />
                    </Box>
                    <Text
                        fz="xs"
                        c="var(--tx2)"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                        {formatKcal(totals.eaten)} eaten ·{" "}
                        {formatKcal(totals.planned)} planned ·{" "}
                        {formatKcal(DAILY_KCAL_TARGET)} target
                    </Text>
                </Stack>

                <Stack gap="sm">
                    {PLANNER_SLOTS.map((slot) => (
                        <SlotSection
                            key={slot}
                            slot={slot}
                            meals={meals.filter((m) => m.slot === slot)}
                            past={past}
                            freshIds={freshIds}
                            onAdd={() => onAdd(selected, slot)}
                            onEdit={onEdit}
                            onToggle={planner.toggleEaten}
                            onRemove={planner.removeMeal}
                        />
                    ))}
                </Stack>

                <Group
                    gap="sm"
                    justify="space-between"
                    pt="md"
                    style={{ borderTop: "1px solid var(--bd)" }}
                >
                    <Text fz="xs" c="var(--tx3)">
                        This week: {count("eaten")} eaten, {count("planned")}{" "}
                        planned, {count("missed")} missed
                    </Text>
                    {view === "month" && (
                        <Button
                            variant="subtle"
                            size="xs"
                            h={28}
                            px="xs"
                            leftSection={<CalendarRange size={13} />}
                            onClick={() => planner.openDay(selected)}
                            styles={{
                                inner: { gap: "var(--mantine-spacing-xs)" },
                            }}
                        >
                            Open week
                        </Button>
                    )}
                </Group>
            </Stack>
        </Paper>
    );
}

function SlotSection({
    slot,
    meals,
    past,
    freshIds,
    onAdd,
    onEdit,
    onToggle,
    onRemove,
}: {
    slot: PlannerSlot;
    meals: PlannedMeal[];
    past: boolean;
    freshIds: Set<string>;
    onAdd: () => void;
    onEdit: (meal: PlannedMeal) => void;
    onToggle: (meal: PlannedMeal) => void;
    onRemove: (meal: PlannedMeal) => void;
}) {
    const meta = SLOT_META[slot];
    const Icon = meta.icon;

    return (
        <Stack gap="xs">
            <Group gap="xs" wrap="nowrap" c={meta.color}>
                <Icon size={12} />
                <Text
                    fz="xxs"
                    fw={700}
                    tt="uppercase"
                    lts="var(--ls-wide)"
                    c="inherit"
                    style={{ flex: 1 }}
                >
                    {meta.label}
                </Text>
                <Text fz="xxs" c="var(--tx3)" ff="var(--font-mono)" fw={500}>
                    {meta.time}
                </Text>
                {meals.length > 0 && (
                    <ActionIcon
                        variant="subtle"
                        size={22}
                        radius="xs"
                        aria-label={`Add ${meta.label.toLowerCase()}`}
                        title={`Add ${meta.label.toLowerCase()}`}
                        onClick={onAdd}
                    >
                        <Plus size={13} />
                    </ActionIcon>
                )}
            </Group>

            {meals.map((meal) => {
                const state = mealState(meal, past);
                return (
                    <Group
                        key={meal.id}
                        gap="sm"
                        wrap="nowrap"
                        px="sm"
                        py="sm"
                        bg="var(--sf2)"
                        opacity={state === "missed" ? 0.55 : 1}
                        style={{
                            borderRadius: "var(--mantine-radius-sm)",
                            border:
                                state === "eaten"
                                    ? `1px solid ${tint(meta.color, 28)}`
                                    : state === "missed"
                                      ? "1.5px dashed var(--bd2)"
                                      : `1.5px dashed ${tint(meta.color, 60)}`,
                            boxShadow: freshIds.has(meal.id)
                                ? `0 0 0 3px ${tint(meta.color, 40)}`
                                : "none",
                            transition: "box-shadow 400ms",
                        }}
                    >
                        <EatenToggle
                            eaten={state === "eaten"}
                            color={meta.color}
                            size={22}
                            onToggle={() => onToggle(meal)}
                        />
                        <Box style={{ flex: 1 }} miw={0}>
                            <Text fz="sm" fw={600} truncate>
                                {meal.name}
                            </Text>
                            <Text fz="xxs" c="var(--tx3)">
                                {STATE_LABEL[state]} · {meal.kcal} kcal
                            </Text>
                        </Box>
                        <ActionIcon
                            variant="subtle"
                            size={26}
                            radius="xs"
                            aria-label={`Edit ${meal.name}`}
                            title="Edit"
                            onClick={() => onEdit(meal)}
                        >
                            <Pencil size={13} />
                        </ActionIcon>
                        <ActionIcon
                            variant="subtle"
                            size={26}
                            radius="xs"
                            aria-label={`Remove ${meal.name}`}
                            title="Remove"
                            onClick={() => onRemove(meal)}
                            style={{
                                "--ai-hover-color": "var(--ro)",
                            }}
                        >
                            <X size={13} />
                        </ActionIcon>
                    </Group>
                );
            })}

            {meals.length === 0 &&
                (past ? (
                    <Text
                        fz="xs"
                        c="var(--tx3)"
                        h={36}
                        px="md"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            borderRadius: "var(--mantine-radius-sm)",
                            border: "1px dashed var(--bd2)",
                        }}
                    >
                        No {meta.label.toLowerCase()} logged
                    </Text>
                ) : (
                    <UnstyledButton
                        onClick={onAdd}
                        h={36}
                        px="md"
                        fz="xs"
                        c="var(--tx3)"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--mantine-spacing-xs)",
                            borderRadius: "var(--mantine-radius-sm)",
                            border: "1px dashed var(--bd2)",
                        }}
                    >
                        <Plus size={12} />
                        Add one, or pick from the tray
                    </UnstyledButton>
                ))}
        </Stack>
    );
}
