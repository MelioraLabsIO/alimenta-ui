"use client";

import {
    ActionIcon,
    Avatar,
    Box,
    Group,
    Paper,
    Skeleton,
    Stack,
    Text,
    Tooltip,
} from "@mantine/core";
import { Crown, X } from "lucide-react";
import type { SpinSessionParticipant } from "../types";
import { getInitialsFromName } from "@/lib/profile";

const MAX_PARTICIPANTS = 10;

/** Monogram gradients, cycled by join order so each person gets a colour. */
export const AVATAR_GRADIENTS = [
    { from: "alimenta", to: "sky", deg: 135 },
    { from: "rose", to: "amber", deg: 135 },
    { from: "sky", to: "alimenta", deg: 135 },
    { from: "amber", to: "alimenta", deg: 135 },
    { from: "alimenta", to: "rose", deg: 135 },
];

export function avatarGradient(index: number) {
    return AVATAR_GRADIENTS[
        ((index % AVATAR_GRADIENTS.length) + AVATAR_GRADIENTS.length) %
            AVATAR_GRADIENTS.length
    ];
}

interface SessionParticipantsProps {
    participants: SpinSessionParticipant[];
    hostUserId: string;
    /** Whether the current viewer is the session host — controls remove-participant access. */
    isHost?: boolean;
    onRemoveParticipant?: (participantId: string) => void;
    isLoading?: boolean;
    error?: string | null;
}

function ParticipantRow({
    participant,
    index,
    hostUserId,
    canRemove,
    onRemove,
}: {
    participant: SpinSessionParticipant;
    index: number;
    hostUserId: string;
    canRemove: boolean;
    onRemove?: (participantId: string) => void;
}) {
    const isParticipantHost =
        participant.userId !== "" && participant.userId === hostUserId;
    const pick = participant.foodName?.trim();

    return (
        <Group
            role="listitem"
            gap={12}
            wrap="nowrap"
            p={8}
            style={{ borderRadius: 14 }}
        >
            <Avatar size={36} fz={12} gradient={avatarGradient(index)}>
                {getInitialsFromName(participant.displayName)}
            </Avatar>

            <Box flex={1} miw={0}>
                <Group gap={6} wrap="nowrap">
                    <Text fw={600} fz={14} truncate>
                        {participant.displayName}
                    </Text>
                    {isParticipantHost && (
                        <Crown
                            size={12}
                            color="var(--am)"
                            aria-label="Session host"
                            style={{ flexShrink: 0 }}
                        />
                    )}
                </Group>
                <Text fz={12} c={pick ? "var(--tx2)" : "var(--tx3)"} truncate>
                    {pick ?? "Still choosing…"}
                </Text>
            </Box>

            <Tooltip label={pick ? "Picked" : "Still choosing"}>
                <Box
                    w={8}
                    h={8}
                    style={{
                        borderRadius: 999,
                        flexShrink: 0,
                        background: pick ? "var(--ac)" : "var(--bd2)",
                    }}
                    aria-hidden="true"
                />
            </Tooltip>

            {/* Remove participant — host only, can't remove themselves */}
            {canRemove && !isParticipantHost && (
                <ActionIcon
                    variant="subtle"
                    size={30}
                    radius={9}
                    c="var(--tx3)"
                    onClick={() => onRemove?.(participant.id)}
                    aria-label={`Remove ${participant.displayName}`}
                >
                    <X size={14} />
                </ActionIcon>
            )}
        </Group>
    );
}

/**
 * "Who's in" card showing all participants connected to the shared session,
 * with each person's pick. Supports empty, loading, and error states.
 */
export function SessionParticipants({
    participants,
    hostUserId,
    isHost = false,
    onRemoveParticipant,
    isLoading,
    error,
}: SessionParticipantsProps) {
    return (
        <Paper p={18} style={{ border: "1px solid var(--bd)" }}>
            <Group justify="space-between" align="center" mb={12}>
                <Text fw={700} fz={15}>
                    Who&apos;s in
                </Text>
                {!isLoading && !error && (
                    <Text fz={12} c="var(--tx3)">
                        {participants.length} of {MAX_PARTICIPANTS}
                    </Text>
                )}
            </Group>

            {isLoading ? (
                <Stack gap={6} aria-label="Loading participants">
                    {[1, 2, 3].map((i) => (
                        <Group key={i} gap={12} p={8} wrap="nowrap">
                            <Skeleton h={36} w={36} radius={999} />
                            <Skeleton h={14} w={120} radius={999} />
                        </Group>
                    ))}
                </Stack>
            ) : error ? (
                <Text fz={13} c="var(--ro)" py={8}>
                    {error}
                </Text>
            ) : participants.length === 0 ? (
                <Text fz={13} c="var(--tx3)" py={8}>
                    No participants yet. Share the link to invite others.
                </Text>
            ) : (
                <Stack gap={6} role="list" aria-label="Session participants">
                    {participants.map((p, i) => (
                        <ParticipantRow
                            key={p.id}
                            participant={p}
                            index={i}
                            hostUserId={hostUserId}
                            canRemove={isHost}
                            onRemove={onRemoveParticipant}
                        />
                    ))}
                </Stack>
            )}
        </Paper>
    );
}
