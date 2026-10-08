"use client";

import {
    Box,
    Button,
    Group,
    Paper,
    Stack,
    Text,
    ThemeIcon,
    Title,
} from "@mantine/core";
import { Dices, Sparkles, User, Users, Utensils } from "lucide-react";

type CreateSessionViewProps = {
    isCreatingSession: boolean;
    onCreateSession: () => void;
};

const GHOSTS = [
    { icon: User, gradient: { from: "alimenta", to: "sky", deg: 135 } },
    { icon: Users, gradient: { from: "rose", to: "amber", deg: 135 } },
    { icon: Utensils, gradient: { from: "sky", to: "alimenta", deg: 135 } },
    { icon: Dices, gradient: { from: "amber", to: "alimenta", deg: 135 } },
];

/** The "No active session" empty state — one big CTA to start a session. */
export function CreateSessionView({
    isCreatingSession,
    onCreateSession,
}: CreateSessionViewProps) {
    return (
        <Paper
            radius="xxl"
            py={48}
            px="xxl"
            pos="relative"
            style={{ overflow: "hidden", border: "1px solid var(--bd)" }}
        >
            <Box
                pos="absolute"
                w={520}
                h={520}
                style={{
                    top: -200,
                    left: "50%",
                    marginLeft: -260,
                    borderRadius: "var(--mantine-radius-pill)",
                    background:
                        "radial-gradient(circle, var(--acs), transparent 65%)",
                    pointerEvents: "none",
                }}
            />
            <Stack align="center" gap="md" ta="center" pos="relative">
                <Group gap={0} pl="sm" wrap="nowrap">
                    {GHOSTS.map(({ icon: Icon, gradient }, i) => (
                        <ThemeIcon
                            key={i}
                            variant="gradient"
                            gradient={gradient}
                            size={52}
                            radius="pill"
                            ml={-10}
                            style={{
                                border: "3px solid var(--sf)",
                                animation:
                                    "alm-in 500ms var(--motion-spring) both",
                                animationDelay: `${i * 70}ms`,
                            }}
                        >
                            <Icon size={20} />
                        </ThemeIcon>
                    ))}
                </Group>
                <Title order={2} fw={700} lts="var(--ls-snug)">
                    No active session
                </Title>
                <Text fz="md" c="var(--tx2)" maw={440} lh="lg">
                    Start a session and share the link. Everyone adds one meal,
                    you spin, and the whole group sees the result live.
                </Text>
                <Button
                    mt="xs"
                    variant="gradient"
                    size="xl"
                    h={52}
                    px="xxl"
                    fz="lg"
                    fw={700}
                    onClick={onCreateSession}
                    loading={isCreatingSession}
                    leftSection={<Sparkles size={18} />}
                    aria-label="Create shared session"
                >
                    Create a session
                </Button>
                <Text fz="xs" c="var(--tx3)">
                    Up to 10 people · one link for everyone
                </Text>
            </Stack>
        </Paper>
    );
}
