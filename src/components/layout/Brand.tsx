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
        <Group gap={10} wrap="nowrap">
            <ThemeIcon
                variant="gradient"
                size={34}
                radius={11}
                style={{ boxShadow: "0 8px 20px rgba(59, 214, 146, 0.3)" }}
            >
                <Leaf size={17} />
            </ThemeIcon>
            <Text fw={700} fz={17} lts="-0.02em" c="var(--tx)">
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
