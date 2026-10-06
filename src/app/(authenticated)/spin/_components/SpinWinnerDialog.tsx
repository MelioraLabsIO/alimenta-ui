"use client";

import { Button, Modal, Stack, Text, ThemeIcon } from "@mantine/core";
import { PartyPopper } from "lucide-react";

interface SpinWinnerDialogProps {
    open: boolean;
    onOpenChangeAction: (open: boolean) => void;
    /** Winning participant's display name. */
    displayName: string;
    /** The food the group is eating. */
    foodName: string;
}

/**
 * Celebratory, screen-centered announcement shown to every participant once
 * the wheel lands on the backend-chosen winner. Driven by the
 * `spin.completed` realtime event, so hosts and guests see it in sync.
 */
export function SpinWinnerDialog({
    open,
    onOpenChangeAction,
    displayName,
    foodName,
}: SpinWinnerDialogProps) {
    return (
        <Modal
            opened={open}
            onClose={() => onOpenChangeAction(false)}
            size={420}
            padding={0}
            withCloseButton={false}
            aria-label="Spin result"
        >
            <Stack
                align="center"
                gap={14}
                ta="center"
                pt={40}
                px={32}
                pb={32}
                style={{
                    background:
                        "radial-gradient(400px 220px at 50% 0%, var(--acs), transparent)",
                }}
            >
                <ThemeIcon
                    variant="gradient"
                    size={80}
                    radius={999}
                    style={{ boxShadow: "0 16px 40px rgba(59,214,146,0.35)" }}
                >
                    <PartyPopper size={36} aria-hidden="true" />
                </ThemeIcon>

                <Text
                    fz={12}
                    fw={700}
                    lts="0.06em"
                    tt="uppercase"
                    c="var(--ac)"
                >
                    The wheel has spoken
                </Text>
                <Text fz={34} fw={700} lts="-0.04em" lh={1.05}>
                    {foodName || "—"}
                </Text>
                <Text fz={14} c="var(--tx2)">
                    {displayName
                        ? `${displayName}'s pick won the spin — that's what we're eating!`
                        : "That's what we're eating!"}
                </Text>

                <Button
                    mt={8}
                    size="lg"
                    px={28}
                    fw={700}
                    onClick={() => onOpenChangeAction(false)}
                >
                    Sounds good
                </Button>
            </Stack>
        </Modal>
    );
}
