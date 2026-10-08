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
        <Paper p="lg" style={{ border: "1px solid var(--bd)" }}>
            <Text fw={700} fz="md" mb="md">
                How it works
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                {steps.map(({ icon: Icon, title, description }) => (
                    <Stack key={title} gap="xs">
                        <Group gap="sm" wrap="nowrap">
                            <ThemeIcon size={28} radius="xs">
                                <Icon size={14} aria-hidden="true" />
                            </ThemeIcon>
                            <Text fz="sm" fw={600}>
                                {title}
                            </Text>
                        </Group>
                        <Text fz="xs" c="var(--tx2)" lh="md">
                            {description}
                        </Text>
                    </Stack>
                ))}
            </SimpleGrid>
        </Paper>
    );
}
