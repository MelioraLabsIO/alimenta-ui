"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import {
    Box,
    Button,
    Group,
    Modal,
    Paper,
    Stack,
    Text,
    UnstyledButton,
} from "@mantine/core";
import { Check, Copy, Crown, Share2, Users } from "lucide-react";
import { routes } from "@/lib/routes";
import type { SpinSession } from "../types";
import { isSpinSessionComplete } from "../session-lock";

interface SessionShareCardProps {
    session: SpinSession;
    joinUrl?: string;
    isHost: boolean;
    /** Host only: "End session" — opens the caller's delete confirmation. */
    onEndSession?: () => void;
    /** Non-host members: "Leave" — opens the caller's leave confirmation. */
    onLeave?: () => void;
}

/**
 * Gradient-border session card: the QR tile (tap to enlarge), who you are in
 * this session, the join link and the copy / end / leave actions. Lives at
 * the top of the right column of the Shared layout and in the guest room.
 */
export function SessionShareCard({
    session,
    joinUrl,
    isHost,
    onEndSession,
    onLeave,
}: SessionShareCardProps) {
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    const sessionComplete = isSpinSessionComplete(session);
    const joinPath = routes.spinSession(session.id);
    const resolvedJoinUrl =
        joinUrl && joinUrl.trim().length > 0
            ? joinUrl
            : typeof window !== "undefined"
              ? `${window.location.origin}${joinPath}`
              : joinPath.slice(1);
    const displayLink = resolvedJoinUrl.replace(/^https?:\/\//, "");

    async function handleCopyJoinLink() {
        try {
            await navigator.clipboard.writeText(resolvedJoinUrl);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        } catch {
            setCopiedLink(false);
        }
    }

    const copyIcon = copiedLink ? <Check size={13} /> : <Copy size={13} />;
    const copyLabel = copiedLink ? "Copied" : "Copy link";

    return (
        <>
            <Box
                p={1.5}
                style={{
                    borderRadius: "var(--mantine-radius-xl)",
                    background: "var(--gradient-accent)",
                    boxShadow: "var(--sh)",
                }}
            >
                <Paper
                    p="lg"
                    shadow="none"
                    style={{
                        borderRadius: "calc(var(--mantine-radius-xl) - 1.5px)",
                    }}
                >
                    <Group gap="lg" align="center" wrap="nowrap">
                        <UnstyledButton
                            onClick={() => setShareDialogOpen(true)}
                            disabled={sessionComplete}
                            aria-label="Share session QR code"
                            w={92}
                            h={92}
                            p="sm"
                            bg="white"
                            style={{
                                flexShrink: 0,
                                borderRadius: "var(--mantine-radius-md)",
                                transition: "transform var(--motion-normal)",
                                opacity: sessionComplete ? 0.5 : 1,
                            }}
                        >
                            <QRCode
                                value={resolvedJoinUrl}
                                size={76}
                                style={{ display: "block" }}
                            />
                        </UnstyledButton>

                        <Box flex={1} miw={0}>
                            {isHost ? (
                                <Group
                                    gap="xs"
                                    wrap="nowrap"
                                    fz="xs"
                                    fw={700}
                                    c="var(--am)"
                                >
                                    <Crown size={13} aria-hidden="true" />
                                    You&apos;re the host
                                </Group>
                            ) : (
                                <Group
                                    gap="xs"
                                    wrap="nowrap"
                                    fz="xs"
                                    fw={700}
                                    c="var(--ac)"
                                >
                                    <Users size={13} aria-hidden="true" />
                                    You&apos;re in
                                </Group>
                            )}
                            <Text fw={700} fz="lg" mt="xxs">
                                Shared session
                            </Text>
                            <Text
                                fz="xs"
                                c="var(--tx3)"
                                mt="xxs"
                                style={{ wordBreak: "break-all" }}
                            >
                                {displayLink}
                            </Text>
                            <Group gap="xs" mt="sm">
                                <Button
                                    variant="surface"
                                    size="xs"
                                    leftSection={copyIcon}
                                    onClick={handleCopyJoinLink}
                                    aria-label={
                                        copiedLink
                                            ? "Join link copied"
                                            : "Copy join link"
                                    }
                                >
                                    {copyLabel}
                                </Button>
                                <Button
                                    variant="subtle"
                                    size="xs"
                                    c="var(--tx3)"
                                    leftSection={<Share2 size={13} />}
                                    onClick={() => setShareDialogOpen(true)}
                                    disabled={sessionComplete}
                                    aria-label="Share session QR code"
                                >
                                    Share
                                </Button>
                                {isHost && onEndSession && (
                                    <Button
                                        variant="subtle"
                                        size="xs"
                                        c="var(--tx3)"
                                        onClick={onEndSession}
                                        aria-label="End session"
                                    >
                                        End session
                                    </Button>
                                )}
                                {!isHost && onLeave && (
                                    <Button
                                        variant="subtle"
                                        size="xs"
                                        c="var(--tx3)"
                                        onClick={onLeave}
                                        aria-label="Leave session"
                                    >
                                        Leave
                                    </Button>
                                )}
                            </Group>
                        </Box>
                    </Group>
                </Paper>
            </Box>

            <Modal
                opened={shareDialogOpen}
                onClose={() => setShareDialogOpen(false)}
                size={380}
                padding="xxl"
                aria-label="Share this session"
            >
                <Stack align="center" gap="md" ta="center">
                    <Text fz="xxl" fw={700} lts="var(--ls-snug)">
                        Invite friends
                    </Text>
                    <Text fz="md" c="var(--tx2)">
                        Scan to join, or send the link.
                    </Text>
                    <Box
                        w={220}
                        h={220}
                        p="lg"
                        bg="white"
                        style={{ borderRadius: "var(--mantine-radius-xl)" }}
                        aria-label="QR code to join this session"
                    >
                        <QRCode
                            value={resolvedJoinUrl}
                            size={188}
                            style={{ display: "block" }}
                        />
                    </Box>
                    <Text
                        fz="sm"
                        c="var(--tx3)"
                        style={{ wordBreak: "break-all" }}
                    >
                        {displayLink}
                    </Text>
                    <Button
                        h={44}
                        px="xl"
                        fw={700}
                        leftSection={
                            copiedLink ? (
                                <Check size={15} />
                            ) : (
                                <Copy size={15} />
                            )
                        }
                        onClick={handleCopyJoinLink}
                        aria-label={
                            copiedLink ? "Join link copied" : "Copy join link"
                        }
                    >
                        {copiedLink ? "Copied link" : "Copy link"}
                    </Button>
                </Stack>
            </Modal>
        </>
    );
}
