"use client";

import { Box, Group, Text } from "@mantine/core";
import type { PlannedMeal } from "@/core/types/models/planner";
import { EatenToggle } from "./EatenToggle";
import { SLOT_META, mealState, mealSurface, tint } from "./planner-meta";

/** A meal on the week board: slot label, name, kcal and the eaten tick. */
export function BoardMealCard({
    meal,
    past,
    fresh,
    onToggle,
}: {
    meal: PlannedMeal;
    past: boolean;
    fresh: boolean;
    onToggle: () => void;
}) {
    const meta = SLOT_META[meal.slot];
    const Icon = meta.icon;
    const state = mealState(meal, past);
    const surface = mealSurface(state, meta.color);

    return (
        <Box
            p="sm"
            bg={surface.bg}
            opacity={surface.opacity}
            style={{
                borderRadius: "var(--mantine-radius-sm)",
                border: surface.border,
                boxShadow: fresh ? `0 0 0 3px ${tint(meta.color, 40)}` : "none",
                transition: "box-shadow 400ms, background-color 150ms",
                animation: "alm-in 240ms ease",
            }}
        >
            <Group gap="xxs" wrap="nowrap" c={meta.color} miw={0}>
                <Icon size={11} style={{ flexShrink: 0 }} />
                <Text
                    fz="xxs"
                    fw={700}
                    tt="uppercase"
                    lts="var(--ls-wide)"
                    truncate
                    c="inherit"
                >
                    {meta.label}
                </Text>
            </Group>
            <Text
                fz="sm"
                fw={600}
                lh="sm"
                mt="xxs"
                style={{ textWrap: "pretty" }}
            >
                {meal.name}
            </Text>
            <Group justify="space-between" gap="xxs" wrap="nowrap" mt="xxs">
                <Text
                    fz="xxs"
                    c="var(--tx3)"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {meal.kcal} kcal
                </Text>
                <EatenToggle
                    eaten={state === "eaten"}
                    color={meta.color}
                    size={18}
                    onToggle={onToggle}
                />
            </Group>
        </Box>
    );
}
