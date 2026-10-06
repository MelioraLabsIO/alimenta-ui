"use client";

import {
    Box,
    Button,
    Group,
    Paper,
    Stack,
    Text,
    ThemeIcon,
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
            radius={28}
            py={48}
            px={32}
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
                    borderRadius: 999,
                    background:
                        "radial-gradient(circle, var(--acs), transparent 65%)",
                    pointerEvents: "none",
                }}
            />
            <Stack align="center" gap={14} ta="center" pos="relative">
                <Group gap={0} pl={10} wrap="nowrap">
                    {GHOSTS.map(({ icon: Icon, gradient }, i) => (
                        <ThemeIcon
                            key={i}
                            variant="gradient"
                            gradient={gradient}
                            size={52}
                            radius={999}
                            ml={-10}
                            style={{
                                border: "3px solid var(--sf)",
                                animation:
                                    "alm-in 500ms cubic-bezier(.2,.8,.2,1) both",
                                animationDelay: `${i * 70}ms`,
                            }}
                        >
                            <Icon size={20} />
                        </ThemeIcon>
                    ))}
                </Group>
                <Text fz={26} fw={700} lts="-0.03em">
                    No active session
                </Text>
                <Text fz={14} c="var(--tx2)" maw={440} lh={1.55}>
                    Start a session and share the link. Everyone adds one meal,
                    you spin, and the whole group sees the result live.
                </Text>
                <Button
                    mt={6}
                    variant="gradient"
                    size="xl"
                    h={52}
                    px={26}
                    fz={16}
                    fw={700}
                    onClick={onCreateSession}
                    loading={isCreatingSession}
                    leftSection={<Sparkles size={18} />}
                    aria-label="Create shared session"
                >
                    Create a session
                </Button>
                <Text fz={12} c="var(--tx3)">
                    Up to 10 people · one link for everyone
                </Text>
            </Stack>
        </Paper>
    );
}
