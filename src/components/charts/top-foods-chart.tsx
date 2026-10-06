"use client";

import { Box, Progress, Stack, Text } from "@mantine/core";

type Props = { data: { food: string; count: number }[] };

/** Per-row bar colours, cycling in the design's order. */
const COLORS = [
    "var(--ac)",
    "var(--bl)",
    "var(--am)",
    "var(--ro)",
    "#a78bfa",
    "#2dd4bf",
    "#fb923c",
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
                <Text fz={13} c="var(--tx3)" ta="center">
                    Log meals to see your top foods.
                </Text>
            </Box>
        );
    }

    return (
        <Stack gap={10} mt={16}>
            {data.map((item, index) => {
                const color = COLORS[index % COLORS.length];
                return (
                    <Box
                        key={item.food}
                        fz={13}
                        style={{
                            display: "grid",
                            gridTemplateColumns: "120px minmax(0, 1fr) 24px",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
                        <Text fz={13} c="var(--tx)" truncate="end">
                            {item.food}
                        </Text>
                        <Progress
                            value={Math.max(8, (item.count / max) * 100)}
                            size={12}
                            radius={999}
                            transitionDuration={800}
                            aria-label={`${item.food}: ${item.count}`}
                            styles={{
                                section: {
                                    borderRadius: 999,
                                    background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 42%, transparent))`,
                                    transitionTimingFunction:
                                        "cubic-bezier(.2,.8,.2,1)",
                                    transitionDelay: `${index * 60}ms`,
                                },
                            }}
                        />
                        <Text
                            fz={13}
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
