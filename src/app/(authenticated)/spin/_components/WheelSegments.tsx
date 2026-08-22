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
import { MAX_WHEEL_SEGMENTS } from "./MealEntryForm";

export interface SegmentRow {
    /** Stable unique ID for this entry. */
    id: string;
    /** Primary label (e.g. meal name, or "Participant — Meal"). */
    label: string;
    /** Optional secondary label shown in a second column (used by Shared mode). */
    sublabel?: string;
    /** Whether the current user may remove this segment. */
    canRemove: boolean;
}

interface WheelSegmentsProps {
    segments: SegmentRow[];
    onRemove: (id: string) => void;
    onClearAll: () => void;
    /** Whether the current user can clear all segments. */
    canClearAll: boolean;
    /**
     * Shown in place of the list while there are no segments. Omit to hide the
     * card entirely when empty, as Personal mode does — there the wheel's own
     * empty state already tells the user to add meals.
     */
    emptyMessage?: string;
}

/**
 * Wheel-segments card for both modes: a labelled list with per-row remove
 * buttons and a "Clear all" action. Personal passes plain labels; Shared
 * passes `sublabel` too, rendering the participant's name beside their meal.
 */
export function WheelSegments({
    segments,
    onRemove,
    onClearAll,
    canClearAll,
    emptyMessage,
}: WheelSegmentsProps) {
    if (segments.length === 0) {
        if (!emptyMessage) return null;

        return (
            <Card className="border-border/50 bg-card/60">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">
                        Wheel segments
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground py-1">
                        {emptyMessage}
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
                        {segments.length} / {MAX_WHEEL_SEGMENTS}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <ul className="space-y-1" aria-label="Wheel segments">
                    {segments.map((seg) => (
                        <li
                            key={seg.id}
                            className="flex items-center gap-2 rounded-md px-2 py-1.5 bg-muted/30"
                        >
                            {seg.sublabel ? (
                                <>
                                    <span className="w-16 sm:w-20 shrink-0 text-sm font-medium truncate">
                                        {seg.label}
                                    </span>
                                    <span className="flex-1 text-sm text-muted-foreground truncate">
                                        {seg.sublabel}
                                    </span>
                                </>
                            ) : (
                                <span className="flex-1 text-sm truncate">
                                    {seg.label}
                                </span>
                            )}

                            {seg.canRemove ? (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                                    onClick={() => onRemove(seg.id)}
                                    aria-label={`Remove ${seg.label}${seg.sublabel ? ` — ${seg.sublabel}` : ""} from wheel`}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            ) : (
                                /* Keep visual space consistent */
                                <span
                                    className="h-6 w-6 shrink-0"
                                    aria-hidden="true"
                                />
                            )}
                        </li>
                    ))}
                </ul>
                {canClearAll && (
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
