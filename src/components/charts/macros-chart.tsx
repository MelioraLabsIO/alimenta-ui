"use client";

import type { ReactNode } from "react";
import { Box, Group, RingProgress, Stack, Text } from "@mantine/core";

type Props = {
    data: { name: string; value: number }[];
    /** Optional caption above the macro figures (e.g. "This week"). */
    label?: string;
    /** Rendered above the macro figures — the design's big kcal stat. */
    children?: ReactNode;
};

const COLORS = ["var(--ac)", "var(--bl)", "var(--am)"];
const SIZE = 128;
const THICKNESS = 10;
const RING_GAP = 3;

/**
 * Three nested rings (protein / carbs / fat), each sized against the largest
 * macro, with the figures beside them. Mirrors the design's `todayRings`.
 */
export function MacrosChart({ data, label, children }: Props) {
    const max = Math.max(...data.map((item) => item.value), 1);

    return (
        <Group gap="xl" align="center" wrap="nowrap">
            <Box pos="relative" w={SIZE} h={SIZE} style={{ flexShrink: 0 }}>
                {data.map((item, index) => {
                    const size = SIZE - index * 2 * (THICKNESS + RING_GAP);
                    const inset = (SIZE - size) / 2;
                    const color = COLORS[index % COLORS.length];
                    return (
                        <RingProgress
                            key={item.name}
                            pos="absolute"
                            top={inset}
                            left={inset}
                            size={size}
                            thickness={THICKNESS}
                            roundCaps
                            rootColor="var(--sf2)"
                            sections={[
                                {
                                    value: (item.value / max) * 92,
                                    color,
                                    tooltip: `${item.name} · ${Math.round(item.value)}g`,
                                },
                            ]}
                        />
                    );
                })}
            </Box>
            <Stack gap="md" miw={0}>
                {children}
                <Box>
                    {label && (
                        <Text fz="xxs" c="var(--tx3)" mb="xs">
                            {label}
                        </Text>
                    )}
                    <Group gap="lg">
                        {data.map((item, index) => (
                            <Box key={item.name} fz="xs">
                                <Group gap="xs" wrap="nowrap">
                                    <Box
                                        w={7}
                                        h={7}
                                        bg={COLORS[index % COLORS.length]}
                                        style={{
                                            borderRadius:
                                                "var(--mantine-radius-pill)",
                                        }}
                                    />
                                    <Text fz="xs" c="var(--tx3)">
                                        {item.name}
                                    </Text>
                                </Group>
                                <Text
                                    fw={700}
                                    fz="md"
                                    mt="xxs"
                                    style={{
                                        fontVariantNumeric: "tabular-nums",
                                    }}
                                >
                                    {Math.round(item.value)}g
                                </Text>
                            </Box>
                        ))}
                    </Group>
                </Box>
            </Stack>
        </Group>
    );
}
