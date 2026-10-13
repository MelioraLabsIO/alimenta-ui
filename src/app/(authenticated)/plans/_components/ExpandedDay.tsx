"use client";

import {
    ActionIcon,
    Box,
    Group,
    Stack,
    Text,
    UnstyledButton,
} from "@mantine/core";
import { Pencil, Plus, X } from "lucide-react";
import {
    PLANNER_SLOTS,
    type PlannedMeal,
    type PlannerSlot,
} from "@/core/types/models/planner";
import { formatDayTitle, formatRelativeDay } from "@/lib/planner-dates";
import { EatenToggle } from "./EatenToggle";
import {
    DAILY_KCAL_TARGET,
    SLOT_META,
    dayTotals,
    formatKcal,
    kcalShares,
    mealState,
    tint,
} from "./planner-meta";
import type { PlannerState } from "./usePlanner";

/**
 * The selected day, opened in place on the week board: calorie bar against
 * the target and each meal slot with its meals (tick, edit, remove).
 */
export function ExpandedDay({
    planner,
    onAdd,
    onEdit,
}: {
    planner: PlannerState;
    onAdd: (date: string, slot: PlannerSlot) => void;
    onEdit: (meal: PlannedMeal) => void;
}) {
    const { today, selected, selectedDate, plans, picked, freshIds } = planner;
    const past = selectedDate < today;
    const meals = plans[selected] ?? [];
    const totals = dayTotals(meals, past);
    const { eatenPct, plannedPct } = kcalShares(totals);

    return (
        <Stack gap="md" p="xs" style={{ animation: "alm-in 240ms ease" }}>
            <Group align="flex-start" gap="sm" wrap="nowrap">
                <Box style={{ flex: 1 }} miw={0}>
                    <Text fz="xs" c="var(--tx3)">
                        {formatRelativeDay(selectedDate, today)}
                    </Text>
                    <Text fz="xxl" fw={700} lts="var(--ls-snug)" truncate>
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
                            animation: "alm-pulse 1.4s ease-in-out infinite",
                        }}
                    >
                        <Plus size={13} />
                        Place here
                    </UnstyledButton>
                )}
            </Group>

            <Stack gap="xs">
                <Box
                    h={8}
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

            <Stack gap="md">
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
        </Stack>
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
    const lower = meta.label.toLowerCase();

    return (
        <Stack gap="xs" miw={0}>
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
                        aria-label={`Add ${lower}`}
                        title={`Add ${lower}`}
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
                        gap="xs"
                        wrap="nowrap"
                        align="flex-start"
                        p="xs"
                        miw={0}
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
                            size={20}
                            onToggle={() => onToggle(meal)}
                        />
                        <Box style={{ flex: 1 }} miw={0}>
                            <Text fz="sm" fw={600} lh="sm" lineClamp={2}>
                                {meal.name}
                            </Text>
                            <Text
                                fz="xxs"
                                c="var(--tx3)"
                                mt="xxs"
                                style={{ fontVariantNumeric: "tabular-nums" }}
                            >
                                {meal.kcal} kcal
                            </Text>
                        </Box>
                        <Stack gap="xxs" style={{ flexShrink: 0 }}>
                            <ActionIcon
                                variant="subtle"
                                size={22}
                                radius="xs"
                                aria-label={`Edit ${meal.name}`}
                                title="Edit"
                                onClick={() => onEdit(meal)}
                            >
                                <Pencil size={12} />
                            </ActionIcon>
                            <ActionIcon
                                variant="subtle"
                                size={22}
                                radius="xs"
                                aria-label={`Remove ${meal.name}`}
                                title="Remove"
                                onClick={() => onRemove(meal)}
                                style={{
                                    "--ai-hover-color": "var(--ro)",
                                }}
                            >
                                <X size={12} />
                            </ActionIcon>
                        </Stack>
                    </Group>
                );
            })}

            {meals.length === 0 &&
                (past ? (
                    <Text
                        fz="xs"
                        c="var(--tx3)"
                        h={34}
                        px="md"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            borderRadius: "var(--mantine-radius-sm)",
                            border: "1px dashed var(--bd2)",
                        }}
                    >
                        No {lower} logged
                    </Text>
                ) : (
                    <UnstyledButton
                        onClick={onAdd}
                        h={34}
                        px="md"
                        fz="xs"
                        c="var(--tx3)"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--mantine-spacing-xs)",
                            borderRadius: "var(--mantine-radius-sm)",
                            border: "1px dashed var(--bd2)",
                            whiteSpace: "nowrap",
                        }}
                    >
                        <Plus size={12} />
                        Add {lower}
                    </UnstyledButton>
                ))}
        </Stack>
    );
}
