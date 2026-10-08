"use client";

import { Box, Progress, Stack, Text } from "@mantine/core";
import { shared } from "@/lib/mantine/tokens";

type Props = { data: { food: string; count: number }[] };

/** Per-row bar colours, cycling in the design's order. */
const COLORS = [
    "var(--ac)",
    "var(--bl)",
    "var(--am)",
    "var(--ro)",
    shared.wheel[4],
    shared.wheel[5],
    shared.wheel[6],
];

/**
 * "Your most eaten": one row per food — fixed-width label, a 12px pill track
 * with a gradient fill that eases in row by row, and a tabular count.
 */
export function TopFoodsChart({ data }: Props) {
    const max = Math.max(...data.map((item) => item.count), 1);

    if (data.length === 0) {
        return (
            <Box
                h={220}
                display="flex"
                style={{ alignItems: "center", justifyContent: "center" }}
            >
                <Text fz="sm" c="var(--tx3)" ta="center">
                    Log meals to see your top foods.
                </Text>
            </Box>
        );
    }

    return (
        <Stack gap="sm" mt="lg">
            {data.map((item, index) => {
                const color = COLORS[index % COLORS.length];
                return (
                    <Box
                        key={item.food}
                        fz="sm"
                        style={{
                            display: "grid",
                            gridTemplateColumns: "120px minmax(0, 1fr) 24px",
                            alignItems: "center",
                            gap: "var(--mantine-spacing-md)",
                        }}
                    >
                        <Text fz="sm" c="var(--tx)" truncate="end">
                            {item.food}
                        </Text>
                        <Progress
                            value={Math.max(8, (item.count / max) * 100)}
                            size={12}
                            radius="pill"
                            transitionDuration={800}
                            aria-label={`${item.food}: ${item.count}`}
                            styles={{
                                section: {
                                    borderRadius: "var(--mantine-radius-pill)",
                                    background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 42%, transparent))`,
                                    transitionTimingFunction:
                                        "var(--motion-spring)",
                                    transitionDelay: `${index * 60}ms`,
                                },
                            }}
                        />
                        <Text
                            fz="sm"
                            fw={700}
                            ta="right"
                            style={{ fontVariantNumeric: "tabular-nums" }}
                        >
                            {item.count}
                        </Text>
                    </Box>
                );
            })}
        </Stack>
    );
}
