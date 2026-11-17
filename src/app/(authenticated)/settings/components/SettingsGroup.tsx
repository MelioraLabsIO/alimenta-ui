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
    requirement,
    error,
}: {
    label: string;
    children: ReactNode;
    /** Free-form content (chips, inputs) instead of rows. */
    padded?: boolean;
    /** Marks a form field as required or optional next to its caption. */
    requirement?: "required" | "optional";
    /** A validation message shown under the container. */
    error?: string;
}) {
    return (
        <Stack gap="sm">
            <Group gap="xs" pl="lg">
                <Text
                    fz="xxs"
                    fw={600}
                    c="var(--tx3)"
                    tt="uppercase"
                    lts="var(--ls-wide)"
                >
                    {label}
                </Text>
                {requirement && (
                    <Text
                        fz="xxs"
                        fw={600}
                        c={
                            requirement === "required"
                                ? "var(--ro)"
                                : "var(--tx3)"
                        }
                        style={{
                            opacity: requirement === "required" ? 1 : 0.7,
                        }}
                    >
                        {requirement === "required" ? "Required" : "Optional"}
                    </Text>
                )}
            </Group>
            <Box
                bg="var(--sf2)"
                py={padded ? "md" : 0}
                px={padded ? "lg" : 0}
                style={{
                    borderRadius: "var(--mantine-radius-lg)",
                    border: `1px solid ${error ? "var(--ro)" : "var(--bd)"}`,
                    overflow: "hidden",
                }}
            >
                {children}
            </Box>
            {error && (
                <Text fz="xs" c="var(--ro)" pl="lg" role="alert">
                    {error}
                </Text>
            )}
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
