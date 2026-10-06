"use client";

import type { ReactNode } from "react";
import { Box, Group, Stack, Text } from "@mantine/core";

/**
 * The design's grouped list: an uppercase caption above an `--sf2` container
 * whose rows are separated by hairlines. Put `SettingsRow`s inside.
 */
export function SettingsGroup({
    label,
    children,
    padded = false,
}: {
    label: string;
    children: ReactNode;
    /** Free-form content (chips, inputs) instead of rows. */
    padded?: boolean;
}) {
    return (
        <Stack gap={8}>
            <Text
                fz={11}
                fw={600}
                c="var(--tx3)"
                pl={16}
                tt="uppercase"
                lts="0.07em"
            >
                {label}
            </Text>
            <Box
                bg="var(--sf2)"
                p={padded ? "14px 16px" : 0}
                style={{
                    borderRadius: 18,
                    border: "1px solid var(--bd)",
                    overflow: "hidden",
                }}
            >
                {children}
            </Box>
        </Stack>
    );
}

export function SettingsRow({
    children,
    last = false,
    onClick,
    minHeight = 56,
    color,
}: {
    children: ReactNode;
    /** Rows draw a bottom hairline except the last one. */
    last?: boolean;
    onClick?: () => void;
    minHeight?: number;
    color?: string;
}) {
    return (
        <Group
            gap={12}
            wrap="nowrap"
            px={16}
            mih={minHeight}
            c={color}
            onClick={onClick}
            style={{
                borderBottom: last ? "none" : "1px solid var(--bd)",
                cursor: onClick ? "pointer" : undefined,
                transition: "background 150ms",
            }}
        >
            {children}
        </Group>
    );
}
