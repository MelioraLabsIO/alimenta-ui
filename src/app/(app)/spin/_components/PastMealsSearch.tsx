"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
} from "@/components/mantine/ui";
import { getRecentMeals } from "@/apis/meal/queries";

interface PastMealsSearchProps {
    /** Currently active segments so the toggle button reflects "added" state. */
    addedLabels: string[];
    canAddMore: boolean;
    onAdd: (label: string) => void;
    onRemoveByLabel: (label: string) => void;
}

/**
 * Card showing the user's recent meals so they can quickly add/remove them
 * from the wheel. Shared by Personal and Shared modes.
 * Only rendered for authenticated users (this component always assumes auth).
 */
export function PastMealsSearch({
    addedLabels,
    canAddMore,
    onAdd,
    onRemoveByLabel,
}: PastMealsSearchProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const { data: pastMeals = [], isLoading: isLoadingMeals } = useQuery({
        queryKey: ["meals-for-wheel"],
        queryFn: () => getRecentMeals(7),
    });

    const uniquePastMeals = useMemo(
        () =>
            Array.from(
                new Map(
                    [...pastMeals]
                        .sort((a, b) => a.title.localeCompare(b.title))
                        .map((m) => [m.title.toLowerCase(), m.title])
                ).values()
            ),
        [pastMeals]
    );

    const filteredPastMeals = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return q
            ? uniquePastMeals.filter((title) => title.toLowerCase().includes(q))
            : uniquePastMeals;
    }, [uniquePastMeals, searchQuery]);

    const isAdded = (title: string) =>
        addedLabels.some((l) => l.toLowerCase() === title.toLowerCase());

    return (
        <Card className="border-border/50 bg-card/60">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    Search past meals
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
                <Input
                    placeholder="Search meals…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search past meals"
                />
                <div
                    className="max-h-48 overflow-y-auto space-y-1 pr-1"
                    role="list"
                    aria-label="Past meals"
                >
                    {isLoadingMeals ? (
                        <div
                            className="flex items-center justify-center py-6"
                            aria-label="Loading past meals"
                        >
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                    ) : filteredPastMeals.length === 0 ? (
                        <p className="py-4 text-center text-xs text-muted-foreground">
                            {searchQuery
                                ? "No meals match your search."
                                : "No past meals found."}
                        </p>
                    ) : (
                        filteredPastMeals.map((title) => {
                            const added = isAdded(title);
                            return (
                                <div
                                    key={title}
                                    role="listitem"
                                    className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors"
                                >
                                    <span className="text-sm truncate flex-1">
                                        {title}
                                    </span>
                                    <Button
                                        variant={
                                            added ? "secondary" : "outline"
                                        }
                                        size="sm"
                                        className="h-6 text-xs px-2 shrink-0 ml-2"
                                        aria-label={
                                            added
                                                ? `Remove ${title} from wheel`
                                                : `Add ${title} to wheel`
                                        }
                                        onClick={() => {
                                            if (added) {
                                                onRemoveByLabel(title);
                                            } else {
                                                onAdd(title);
                                            }
                                        }}
                                        disabled={!added && !canAddMore}
                                    >
                                        {added ? "Remove" : "Add"}
                                    </Button>
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
