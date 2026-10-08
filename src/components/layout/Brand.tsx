"use client";

import Link from "next/link";
import { Group, Text, ThemeIcon, UnstyledButton } from "@mantine/core";
import { Leaf } from "lucide-react";

/**
 * Leaf mark plus wordmark. Used at the top of the sidebar and on
 * guest-facing session pages that have no app chrome. Pass `href={null}` for
 * a non-link version.
 */
export function Brand({ href = "/" }: { href?: string | null }) {
    const content = (
        <Group gap="sm" wrap="nowrap">
            <ThemeIcon
                variant="gradient"
                size={34}
                radius="sm"
                style={{
                    boxShadow:
                        "0 8px 20px color-mix(in srgb, var(--ac) 30%, transparent)",
                }}
            >
                <Leaf size={17} />
            </ThemeIcon>
            <Text fw={700} fz="xl" lts="var(--ls-snug)" c="var(--tx)">
                Alimenta
            </Text>
        </Group>
    );

    if (!href) return content;

    return (
        <UnstyledButton component={Link} href={href}>
            {content}
        </UnstyledButton>
    );
}
