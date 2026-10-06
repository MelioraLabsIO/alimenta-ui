"use client";

import { Center, Group, SimpleGrid, Text, Tooltip } from "@mantine/core";

type Props = {
    data: { meal: string; mood: number; energy: number; calories: number }[];
};

/** Two rows of seven tiles — the most recent rated meals. */
const MAX_TILES = 14;

function round1(value: number) {
    return (Math.round(value * 10) / 10).toFixed(1);
}

function average(values: number[]) {
    if (!values.length) return null;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * Mood heat tiles: one tile per rated meal, stronger green for a better
 * mood, with the average mood / energy underneath. The points carry no date,
 * so this is "by meal" rather than the design's "by day".
 */
export function MoodScatterChart({ data }: Props) {
    const points = data.slice(0, MAX_TILES);
    const avgMood = average(data.map((point) => point.mood));
    const avgEnergy = average(data.map((point) => point.energy));

    return (
        <>
            {points.length === 0 ? (
                <Center flex={1} mt={14} mb={12} mih={88}>
                    <Text fz={13} c="var(--tx3)" ta="center">
                        Rate how meals made you feel and they show up here.
                    </Text>
                </Center>
            ) : (
                <SimpleGrid cols={7} spacing={6} mt={14} mb={12}>
                    {points.map((point, index) => {
                        const opacity = Math.min(
                            1,
                            Math.max(0.15, 0.15 + ((point.mood - 1) / 4) * 0.85)
                        );
                        return (
                            <Tooltip
                                key={`${point.meal}-${index}`}
                                label={`${point.meal}: mood ${round1(point.mood)}, energy ${round1(point.energy)}`}
                                withArrow
                            >
                                <Center
                                    h={44}
                                    bg="var(--ac)"
                                    style={{
                                        borderRadius: 11,
                                        opacity,
                                        alignItems: "flex-end",
                                        paddingBottom: 6,
                                        cursor: "default",
                                    }}
                                >
                                    <Text
                                        fz={10}
                                        fw={700}
                                        c="var(--act)"
                                        lh={1}
                                    >
                                        {point.mood}
                                    </Text>
                                </Center>
                            </Tooltip>
                        );
                    })}
                </SimpleGrid>
            )}
            <Group justify="space-between" mt="auto">
                <Text fz={12} c="var(--tx2)">
                    Avg mood{" "}
                    <Text component="span" fz={12} fw={700} c="var(--tx)">
                        {avgMood === null ? "—" : round1(avgMood)}
                    </Text>
                </Text>
                <Text fz={12} c="var(--tx2)">
                    Avg energy{" "}
                    <Text component="span" fz={12} fw={700} c="var(--tx)">
                        {avgEnergy === null ? "—" : round1(avgEnergy)}
                    </Text>
                </Text>
            </Group>
        </>
    );
}
