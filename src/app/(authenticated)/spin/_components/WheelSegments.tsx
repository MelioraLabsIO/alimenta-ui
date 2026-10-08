"use client";

import {
    ActionIcon,
    Box,
    Group,
    Paper,
    Stack,
    Text,
    UnstyledButton,
} from "@mantine/core";
import { X } from "lucide-react";
import { MAX_WHEEL_SEGMENTS } from "./MealEntryForm";
import { WHEEL_COLORS } from "./MealSpinWheel";

export interface SegmentRow {
    /** Stable unique ID for this entry. */
    id: string;
    /** Primary label (e.g. meal name, or "Participant — Meal"). */
    label: string;
    /** Optional secondary label shown in a second column (used by Shared mode). */
    sublabel?: string;
    /** Whether the current user may remove this segment. */
    canRemove: boolean;
}

interface WheelSegmentsProps {
    segments: SegmentRow[];
    onRemove: (id: string) => void;
    onClearAll: () => void;
    /** Whether the current user can clear all segments. */
    canClearAll: boolean;
    /**
     * Shown in place of the list while there are no segments. Omit to hide the
     * card entirely when empty, as Personal mode does — there the wheel's own
     * empty state already tells the user to add meals.
     */
    emptyMessage?: string;
}

/**
 * "On the wheel" card for both modes: a list with a colour swatch matching
 * each slice, per-row remove buttons and a "Clear" action. Personal passes
 * plain labels; Shared passes `sublabel` too, rendering the participant's
 * name beside their meal.
 */
export function WheelSegments({
    segments,
    onRemove,
    onClearAll,
    canClearAll,
    emptyMessage,
}: WheelSegmentsProps) {
    if (segments.length === 0 && !emptyMessage) return null;

    return (
        <Paper p="lg" style={{ border: "1px solid var(--bd)" }}>
            <Group justify="space-between" align="center" mb="sm">
                <Text fw={700} fz="md">
                    On the wheel
                </Text>
                <Group gap="sm" align="center">
                    <Text fz="xs" c="var(--tx3)">
                        {segments.length} / {MAX_WHEEL_SEGMENTS}
                    </Text>
                    {canClearAll && segments.length > 0 && (
                        <UnstyledButton
                            onClick={onClearAll}
                            fz="xs"
                            fw={600}
                            c="var(--tx3)"
                            aria-label="Clear all wheel segments"
                            styles={{
                                root: {
                                    transition: "color var(--motion-fast)",
                                },
                            }}
                        >
                            Clear
                        </UnstyledButton>
                    )}
                </Group>
            </Group>

            {segments.length === 0 ? (
                <Text fz="sm" c="var(--tx3)" py="xxs">
                    {emptyMessage}
                </Text>
            ) : (
                <Stack gap="xxs" role="list" aria-label="Wheel segments">
                    {segments.map((seg, i) => (
                        <Group
                            key={seg.id}
                            role="listitem"
                            gap="sm"
                            wrap="nowrap"
                            py="sm"
                            pr="sm"
                            pl="sm"
                            style={{ borderRadius: "var(--mantine-radius-sm)" }}
                        >
                            <Box
                                w={10}
                                h={10}
                                style={{
                                    borderRadius: 4,
                                    flexShrink: 0,
                                    background:
                                        WHEEL_COLORS[i % WHEEL_COLORS.length],
                                }}
                                aria-hidden="true"
                            />
                            {seg.sublabel ? (
                                <Group gap="xs" flex={1} miw={0} wrap="nowrap">
                                    <Text fw={600} fz="md" truncate>
                                        {seg.label}
                                    </Text>
                                    <Text fz="sm" c="var(--tx2)" truncate>
                                        {seg.sublabel}
                                    </Text>
                                </Group>
                            ) : (
                                <Text fw={500} fz="md" flex={1} truncate>
                                    {seg.label}
                                </Text>
                            )}

                            {seg.canRemove ? (
                                <ActionIcon
                                    variant="subtle"
                                    size={28}
                                    radius="xs"
                                    c="var(--tx3)"
                                    onClick={() => onRemove(seg.id)}
                                    aria-label={`Remove ${seg.label}${seg.sublabel ? ` — ${seg.sublabel}` : ""} from wheel`}
                                >
                                    <X size={14} />
                                </ActionIcon>
                            ) : (
                                /* Keep visual space consistent */
                                <Box w={28} h={28} aria-hidden="true" />
                            )}
                        </Group>
                    ))}
                </Stack>
            )}
        </Paper>
    );
}
