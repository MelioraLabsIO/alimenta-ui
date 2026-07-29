"use client";

import { Trash2, X } from "lucide-react";
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/mantine/ui";
import type { SharedEntry } from "../types";
import { MAX_WHEEL_SEGMENTS } from "@/app/(app)/spin/_components/MealEntryForm";

interface SharedWheelSegmentsProps {
    entries: SharedEntry[];
    currentUserId: string;
    isHost: boolean;
    onRemove: (entryId: string) => void;
    onClearAll: () => void;
}

/**
 * Right-column card listing each participant's food entry.
 * Renders participant name and food in two columns (e.g. "Eric — Pizza").
 * Removal is allowed per entry if the viewer is the host OR the entry owner.
 */
export function SharedWheelSegments({
    entries,
    currentUserId,
    isHost,
    onRemove,
    onClearAll,
}: SharedWheelSegmentsProps) {
    if (entries.length === 0) {
        return (
            <Card className="border-border/50 bg-card/60">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">
                        Wheel segments
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground py-1">
                        No meals added yet. Each participant adds one.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50 bg-card/60">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">
                        Wheel segments
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                        {entries.length} / {MAX_WHEEL_SEGMENTS}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <ul className="space-y-1" aria-label="Shared wheel segments">
                    {entries.map((entry) => {
                        const canRemove =
                            isHost || entry.participantId === currentUserId;
                        return (
                            <li
                                key={entry.id}
                                className="flex items-center gap-2 rounded-md px-2 py-1.5 bg-muted/30"
                            >
                                <span className="w-16 sm:w-20 shrink-0 text-sm font-medium truncate">
                                    {entry.participantName}
                                </span>
                                <span className="flex-1 text-sm text-muted-foreground truncate">
                                    {entry.food}
                                </span>
                                {canRemove ? (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                                        onClick={() => onRemove(entry.id)}
                                        aria-label={`Remove ${entry.participantName}'s entry: ${entry.food}`}
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                ) : (
                                    <span
                                        className="h-6 w-6 shrink-0"
                                        aria-hidden="true"
                                    />
                                )}
                            </li>
                        );
                    })}
                </ul>
                {isHost && entries.length > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                        onClick={onClearAll}
                        aria-label="Clear all wheel segments"
                    >
                        <Trash2 className="h-3 w-3" />
                        Clear all
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

