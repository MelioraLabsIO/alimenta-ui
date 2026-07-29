"use client";

import { Avatar, AvatarFallback, Badge, Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/components/mantine/ui";
import type { SessionParticipant } from "../types";

const MAX_PARTICIPANTS = 10;

interface SessionParticipantsProps {
    participants: SessionParticipant[];
    isLoading?: boolean;
    error?: string | null;
}

function ParticipantAvatar({ participant }: { participant: SessionParticipant }) {
    return (
        <li className="flex items-center gap-3 py-1">
            {/* Avatar */}
            <div className="relative shrink-0">
                <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary/20 text-primary font-semibold">
                        {participant.initials}
                    </AvatarFallback>
                </Avatar>
                {/* Online indicator dot */}
                <span
                    aria-label={participant.isConnected ? "Online" : "Offline"}
                    className={[
                        "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-card",
                        participant.isConnected
                            ? "bg-emerald-400"
                            : "bg-muted-foreground/40",
                    ].join(" ")}
                />
            </div>

            {/* Name */}
            <span className="flex-1 text-sm font-medium truncate">
                {participant.name}
            </span>

            {/* Host badge */}
            {participant.isHost && (
                <Badge
                    variant="outline"
                    className="text-[10px] border-emerald-500/30 text-emerald-400 shrink-0"
                    aria-label="Session host"
                >
                    Host
                </Badge>
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
                            <li key={i} className="flex items-center gap-3 py-1">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-4 w-24 rounded" />
                            </li>
                        ))}
                    </ul>
                ) : error ? (
                    <p className="text-sm text-destructive py-2">{error}</p>
                ) : participants.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                        No participants yet. Share the code to invite others.
                    </p>
                ) : (
                    <ul className="space-y-1" aria-label="Session participants">
                        {participants.map((p) => (
                            <ParticipantAvatar key={p.id} participant={p} />
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}

