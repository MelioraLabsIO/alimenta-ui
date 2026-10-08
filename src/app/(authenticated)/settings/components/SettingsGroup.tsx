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
        <Stack gap="sm">
            <Text
                fz="xxs"
                fw={600}
                c="var(--tx3)"
                pl="lg"
                tt="uppercase"
                lts="var(--ls-wide)"
            >
                {label}
            </Text>
            <Box
                bg="var(--sf2)"
                py={padded ? "md" : 0}
                px={padded ? "lg" : 0}
                style={{
                    borderRadius: "var(--mantine-radius-lg)",
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
            gap="md"
            wrap="nowrap"
            px="lg"
            mih={minHeight}
            c={color}
            onClick={onClick}
            style={{
                borderBottom: last ? "none" : "1px solid var(--bd)",
                cursor: onClick ? "pointer" : undefined,
                transition: `background var(--motion-fast)`,
            }}
        >
            {children}
        </Group>
    );
}
