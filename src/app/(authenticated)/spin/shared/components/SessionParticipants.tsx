"use client";

import { X } from "lucide-react";
import {
    Avatar,
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Skeleton,
} from "@/components/mantine/ui";
import type { SpinSessionParticipant } from "../types";
import { getInitialsFromName } from "@/lib/profile";

const MAX_PARTICIPANTS = 10;

interface SessionParticipantsProps {
    participants: SpinSessionParticipant[];
    hostUserId: string;
    /** Whether the current viewer is the session host — controls remove-participant access. */
    isHost?: boolean;
    onRemoveParticipant?: (participantId: string) => void;
    isLoading?: boolean;
    error?: string | null;
}

function ParticipantAvatar({
    participant,
    hostUserId,
    canRemove,
    onRemove,
}: {
    participant: SpinSessionParticipant;
    hostUserId: string;
    canRemove: boolean;
    onRemove?: (participantId: string) => void;
}) {
    const isParticipantHost =
        participant.userId !== "" && participant.userId === hostUserId;

    return (
        <li className="flex items-center gap-3 py-1">
            {/* Avatar */}
            <Avatar className="h-8 w-8 text-xs">
                {getInitialsFromName(participant.displayName)}
            </Avatar>

            {/* Name */}
            <span className="flex-1 text-sm font-medium truncate">
                {participant.displayName}
            </span>

            {/* Host badge */}
            {isParticipantHost && (
                <Badge
                    variant="outline"
                    className="text-[10px] border-emerald-500/30 text-emerald-400 shrink-0"
                    aria-label="Session host"
                >
                    Host
                </Badge>
            )}

            {/* Remove participant — host only, can't remove themselves */}
            {canRemove && !isParticipantHost && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemove?.(participant.id)}
                    aria-label={`Remove ${participant.displayName}`}
                >
                    <X className="h-3.5 w-3.5" />
                </Button>
            )}
        </li>
    );
}

/**
 * Right-column card showing all participants connected to the shared session.
 * Supports empty, loading, and error states.
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
        <Card className="border-border/50 bg-card/60">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">
                        Session participants
                    </CardTitle>
                    {!isLoading && !error && (
                        <Badge variant="secondary" className="text-xs">
                            {participants.length} / {MAX_PARTICIPANTS}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                {isLoading ? (
                    <ul className="space-y-2" aria-label="Loading participants">
                        {[1, 2, 3].map((i) => (
                            <li
                                key={i}
                                className="flex items-center gap-3 py-1"
                            >
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-4 w-24 rounded" />
                            </li>
                        ))}
                    </ul>
                ) : error ? (
                    <p className="text-sm text-destructive py-2">{error}</p>
                ) : participants.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                        No participants yet. Share the link to invite others.
                    </p>
                ) : (
                    <ul className="space-y-1" aria-label="Session participants">
                        {participants.map((p) => (
                            <ParticipantAvatar
                                key={p.id}
                                participant={p}
                                hostUserId={hostUserId}
                                canRemove={isHost}
                                onRemove={onRemoveParticipant}
                            />
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
