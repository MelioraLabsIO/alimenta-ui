"use client";

import { useState } from "react";
import { Box, Center, Flex, Paper, SimpleGrid, Text } from "@mantine/core";

type Props = { data: { date: string; calories: number }[] };

const AREA_HEIGHT = 220;
const BAR_MAX = 160;
/** Dashed placeholder heights (px) for a week with nothing logged. */
const GHOST_HEIGHTS = [64, 112, 88, 144, 96, 128, 72];

/**
 * Seven vertical bars, one per day. The hovered bar (today by default) is
 * painted with the green→blue gradient and shows its value above.
 */
export function CaloriesChart({ data }: Props) {
    const values = data.length ? data : [{ date: "Today", calories: 0 }];
    const [hovered, setHovered] = useState<number | null>(null);
    const max = Math.max(...values.map((item) => item.calories), 1);
    const isEmpty = values.every((item) => item.calories <= 0);
    const active = hovered ?? values.length - 1;

    return (
        <Box pos="relative">
            <SimpleGrid cols={values.length} spacing="md">
                {values.map((item, index) => {
                    const on = !isEmpty && index === active;
                    const height = isEmpty
                        ? GHOST_HEIGHTS[index % GHOST_HEIGHTS.length]
                        : Math.max(6, (item.calories / max) * BAR_MAX);
                    return (
                        <Flex
                            key={`${item.date}-${index}`}
                            direction="column"
                            align="center"
                            justify="flex-end"
                            gap="sm"
                            h={AREA_HEIGHT}
                            onMouseEnter={() => setHovered(index)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            <Text
                                fz="xs"
                                fw={700}
                                style={{
                                    fontVariantNumeric: "tabular-nums",
                                    opacity: on ? 1 : 0,
                                    transform: on
                                        ? "translateY(0)"
                                        : "translateY(4px)",
                                    transition: `opacity var(--motion-fast), transform var(--motion-fast)`,
                                }}
                            >
                                {Math.round(item.calories).toLocaleString()}
                            </Text>
                            <Box
                                w="100%"
                                maw={48}
                                h={height}
                                style={{
                                    borderRadius: "var(--mantine-radius-md)",
                                    background: isEmpty
                                        ? "transparent"
                                        : on
                                          ? "linear-gradient(180deg, var(--ac), color-mix(in srgb, var(--ac) 50%, var(--bl)))"
                                          : "var(--sf2)",
                                    border: isEmpty
                                        ? "1.5px dashed var(--bd2)"
                                        : undefined,
                                    transition: `height 800ms var(--motion-spring), background var(--motion-normal)`,
                                    transitionDelay: `${index * 40}ms`,
                                }}
                            />
                            <Text
                                fz="xs"
                                fw={500}
                                c={on ? "var(--tx)" : "var(--tx3)"}
                            >
                                {item.date}
                            </Text>
                        </Flex>
                    );
                })}
            </SimpleGrid>
            {isEmpty && (
                <Center pos="absolute" style={{ inset: "0 0 28px" }}>
                    <Paper
                        radius="pill"
                        px="md"
                        py="sm"
                        bg="var(--glass)"
                        shadow="none"
                        withBorder
                        style={{ backdropFilter: "blur(10px)" }}
                    >
                        <Text fz="sm" c="var(--tx2)">
                            Your week shows up here after your first meal
                        </Text>
                    </Paper>
                </Center>
            )}
        </Box>
    );
}
