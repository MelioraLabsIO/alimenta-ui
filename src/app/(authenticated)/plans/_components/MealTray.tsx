"use client";

import { Box, Button, Group, Paper, Text, UnstyledButton } from "@mantine/core";
import { Check, LoaderCircle, Shuffle, Sparkles } from "lucide-react";
import type { MealSuggestion } from "@/core/types/models/planner";
import { SLOT_META, tint } from "./planner-meta";
import type { PlannerState } from "./usePlanner";

/**
 * The header strip of AI ideas based on the user's food history. Tap an idea
 * to pick it up, then tap a day (or "Place here" in the day panel) to plan it.
 */
export function MealTray({ planner }: { planner: PlannerState }) {
    const { tray, picked, shuffling } = planner;

    return (
        <Paper
            radius="xl"
            p="md"
            bg="var(--glass)"
            style={{ backdropFilter: "blur(18px)" }}
        >
            <Group gap="sm" wrap="wrap" mb="sm">
                <Sparkles size={15} color="var(--ac)" />
                <Text fw={700}>AI meal tray</Text>
                <Text fz="xs" c="var(--tx3)" miw={200} style={{ flex: 1 }}>
                    {picked
                        ? `Now tap a day to place ${picked.name}`
                        : "Ideas from your recent meals · tap one, then tap a day to plan it"}
                </Text>
                {picked && (
                    <Button
                        variant="surface"
                        size="xs"
                        h={28}
                        radius="xs"
                        c="var(--tx2)"
                        onClick={planner.cancelPick}
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    variant="surface"
                    size="xs"
                    h={28}
                    radius="xs"
                    c="var(--tx2)"
                    onClick={planner.newIdeas}
                    styles={{ inner: { gap: "var(--mantine-spacing-xs)" } }}
                    leftSection={
                        shuffling ? (
                            <LoaderCircle
                                size={13}
                                style={{
                                    animation: "alm-spin 0.8s linear infinite",
                                }}
                            />
                        ) : (
                            <Shuffle size={13} />
                        )
                    }
                >
                    New ideas
                </Button>
            </Group>

            <Box
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fill, minmax(170px, 1fr))",
                    gap: "var(--mantine-spacing-sm)",
                    opacity: shuffling ? 0.4 : 1,
                    transition: "opacity var(--motion-normal)",
                }}
            >
                {tray.map((s) => (
                    <TrayItem
                        key={s.id}
                        suggestion={s}
                        active={picked?.id === s.id}
                        onPick={() => planner.togglePick(s.id)}
                    />
                ))}
            </Box>
        </Paper>
    );
}

function TrayItem({
    suggestion,
    active,
    onPick,
}: {
    suggestion: MealSuggestion;
    active: boolean;
    onPick: () => void;
}) {
    const meta = SLOT_META[suggestion.slot];
    const Icon = meta.icon;

    return (
        <UnstyledButton
            onClick={onPick}
            aria-pressed={active}
            title={`Why: ${suggestion.reason}`}
            px="md"
            py="sm"
            bg={active ? "var(--acs)" : "var(--sf)"}
            style={{
                borderRadius: "var(--mantine-radius-md)",
                border: active
                    ? "1.5px solid var(--ac)"
                    : "1px solid var(--bd)",
                boxShadow: active
                    ? `0 0 0 4px ${tint("var(--ac)", 18)}`
                    : "none",
                transform: active ? "translateY(-2px)" : "none",
                transition: "all 160ms",
            }}
        >
            <Group gap="sm" wrap="nowrap">
                <Box
                    w={30}
                    h={30}
                    bg={tint(meta.color, 16)}
                    c={meta.color}
                    style={{
                        borderRadius: "var(--mantine-radius-xs)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    {active ? <Check size={14} /> : <Icon size={14} />}
                </Box>
                <Box miw={0}>
                    <Text fz="sm" fw={600} truncate>
                        {suggestion.name}
                    </Text>
                    <Text fz="xxs" c="var(--tx3)" truncate>
                        {suggestion.kcal} kcal · {meta.label}
                    </Text>
                </Box>
            </Group>
        </UnstyledButton>
    );
}
