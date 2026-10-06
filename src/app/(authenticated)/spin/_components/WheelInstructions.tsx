"use client";

import {
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
} from "@mantine/core";
import type { LucideIcon } from "lucide-react";

export type WheelInstructionStep = {
    icon: LucideIcon;
    title: string;
    description: string;
};

/**
 * "How it works" card shown under the wheel. The steps differ between
 * Personal and Shared modes, so each page supplies its own — the card itself
 * is identical in both, which is what keeps the two columns balanced.
 */
export function WheelInstructions({
    steps,
}: {
    steps: WheelInstructionStep[];
}) {
    return (
        <Paper p={18} style={{ border: "1px solid var(--bd)" }}>
            <Text fw={700} fz={15} mb={12}>
                How it works
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={12}>
                {steps.map(({ icon: Icon, title, description }) => (
                    <Stack key={title} gap={6}>
                        <Group gap={8} wrap="nowrap">
                            <ThemeIcon size={28} radius={9}>
                                <Icon size={14} aria-hidden="true" />
                            </ThemeIcon>
                            <Text fz={13} fw={600}>
                                {title}
                            </Text>
                        </Group>
                        <Text fz={12} c="var(--tx2)" lh={1.45}>
                            {description}
                        </Text>
                    </Stack>
                ))}
            </SimpleGrid>
        </Paper>
    );
}
