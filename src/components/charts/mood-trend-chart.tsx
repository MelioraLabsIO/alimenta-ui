"use client";

import { Box } from "@mantine/core";
import {
    Area,
    CartesianGrid,
    ComposedChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

type Props = { data: { date: string; mood: number; energy: number }[] };

const MOOD_FILL_ID = "alm-mood-fill";

const TOOLTIP_STYLE = {
    background: "var(--sf)",
    border: "1px solid var(--bd)",
    borderRadius: "var(--mantine-radius-md)",
    boxShadow: "var(--sh)",
    padding: "var(--mantine-spacing-sm) var(--mantine-spacing-md)",
    fontSize: "var(--mantine-font-size-xs)",
    color: "var(--tx)",
};

function formatScore(value: unknown) {
    return typeof value === "number" ? value.toFixed(1) : "—";
}

/**
 * Seven-day mood / energy trend: a solid green mood line over a soft gradient
 * fill and a dotted blue energy line, on dashed hairline grid rows.
 */
export function MoodTrendChart({ data }: Props) {
    return (
        <Box h={210} w="100%" mt="lg">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={data}
                    margin={{ top: 6, right: 8, left: 8, bottom: 0 }}
                >
                    <defs>
                        <linearGradient
                            id={MOOD_FILL_ID}
                            x1="0"
                            x2="0"
                            y1="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor="var(--ac)"
                                stopOpacity={0.25}
                            />
                            <stop
                                offset="100%"
                                stopColor="var(--ac)"
                                stopOpacity={0}
                            />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        horizontal
                        vertical={false}
                        strokeDasharray="4 4"
                        stroke="var(--bd)"
                    />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tickMargin={10}
                        tick={{ fontSize: 12, fill: "var(--tx3)" }}
                    />
                    <YAxis domain={[0, 5]} hide />
                    <Tooltip
                        cursor={{
                            stroke: "var(--bd2)",
                            strokeDasharray: "4 4",
                        }}
                        contentStyle={TOOLTIP_STYLE}
                        labelStyle={{
                            color: "var(--tx3)",
                            fontWeight: 600,
                            marginBottom: "var(--mantine-spacing-xxs)",
                        }}
                        itemStyle={{ color: "var(--tx)", padding: 0 }}
                        formatter={(value, name) => [
                            formatScore(value),
                            name === "mood" ? "Mood" : "Energy",
                        ]}
                    />
                    <Area
                        type="monotone"
                        dataKey="mood"
                        stroke="var(--ac)"
                        strokeWidth={3}
                        strokeLinecap="round"
                        fill={`url(#${MOOD_FILL_ID})`}
                        dot={false}
                        activeDot={{
                            r: 5,
                            fill: "var(--ac)",
                            stroke: "var(--sf)",
                            strokeWidth: 2,
                        }}
                        isAnimationActive={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="energy"
                        stroke="var(--bl)"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeDasharray="1 7"
                        dot={false}
                        activeDot={{
                            r: 5,
                            fill: "var(--bl)",
                            stroke: "var(--sf)",
                            strokeWidth: 2,
                        }}
                        isAnimationActive={false}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </Box>
    );
}
