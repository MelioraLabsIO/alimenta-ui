"use client";

import { Box, Group, Text, UnstyledButton } from "@mantine/core";
import { Sparkles } from "lucide-react";
import { GOALS, type Goal, type Units, tint } from "./settings-types";

function Chip({
    token,
    onClick,
    children,
}: {
    token: string;
    onClick: () => void;
    children: string;
}) {
    return (
        <UnstyledButton
            type="button"
            onClick={onClick}
            px="sm"
            bg={tint(token)}
            c={token}
            fz="inherit"
            fw="inherit"
            lh="inherit"
            style={{
                borderRadius: "var(--mantine-radius-sm)",
                letterSpacing: "inherit",
            }}
        >
            {children}
        </UnstyledButton>
    );
}

/**
 * The one-sentence "food profile" at the top of settings. Each highlighted
 * word is a button: goal and units cycle in place, the food ones jump to the
 * Food preferences tab.
 */
export function FoodProfileSummary({
    goal,
    units,
    dislikes,
    allergies,
    onCycleGoal,
    onCycleUnits,
    onGoToFood,
}: {
    goal: Goal;
    units: Units;
    dislikes: string[];
    allergies: string[];
    onCycleGoal: () => void;
    onCycleUnits: () => void;
    onGoToFood: () => void;
}) {
    const verb = GOALS.find((g) => g.value === goal)?.verb ?? "maintain";
    const list = (items: string[]) =>
        items.length ? items.join(", ").toLowerCase() : "nothing";

    return (
        <Box
            p="xl"
            style={{
                borderRadius: "var(--mantine-radius-xl)",
                background: "color-mix(in srgb, var(--sf2) 60%, transparent)",
                border: "1px solid var(--bd)",
            }}
        >
            <Group gap="sm" wrap="nowrap" c="var(--tx3)" fz="xs" mb="sm">
                <Sparkles size={14} color="var(--ac)" />
                Your food profile · tap to change
            </Group>
            <Text
                fz="xxl"
                lh="xl"
                fw={500}
                c="var(--tx2)"
                style={{ letterSpacing: "var(--ls-snug)", textWrap: "pretty" }}
            >
                I want to{" "}
                <Chip token="var(--ac)" onClick={onCycleGoal}>
                    {verb}
                </Chip>{" "}
                my weight, avoid{" "}
                <Chip token="var(--am)" onClick={onGoToFood}>
                    {list(dislikes)}
                </Chip>
                , I&apos;m allergic to{" "}
                <Chip token="var(--ro)" onClick={onGoToFood}>
                    {list(allergies)}
                </Chip>
                , and I measure in{" "}
                <Chip token="var(--bl)" onClick={onCycleUnits}>
                    {units}
                </Chip>
                .
            </Text>
        </Box>
    );
}
