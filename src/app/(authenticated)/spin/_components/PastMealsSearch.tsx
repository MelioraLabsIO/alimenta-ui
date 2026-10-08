"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Button,
    Center,
    Group,
    Loader,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { Check, Plus, Search } from "lucide-react";
import { getRecentMeals } from "@/apis/meal/queries";

interface PastMealsSearchProps {
    /** Currently active segments so the toggle button reflects "added" state. */
    addedLabels: string[];
    canAddMore: boolean;
    onAdd: (label: string) => void;
    onRemoveByLabel: (label: string) => void;
}

/**
 * "From your recent meals" chips so the user can quickly add/remove them
 * from the wheel. Rendered inside `MealEntryForm`'s card. Shared by Personal
 * and Shared modes — only for authenticated users (this always assumes auth).
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
        <Stack gap="sm">
            <Group justify="space-between" align="center" gap="sm">
                <Text fz="xs" c="var(--tx3)">
                    From your recent meals
                </Text>
                <TextInput
                    size="xs"
                    w={{ base: "100%", xs: 180 }}
                    placeholder="Filter meals…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    leftSection={<Search size={13} />}
                    aria-label="Search past meals"
                />
            </Group>
            {isLoadingMeals ? (
                <Center py="md" aria-label="Loading past meals">
                    <Loader size="sm" />
                </Center>
            ) : filteredPastMeals.length === 0 ? (
                <Text fz="xs" c="var(--tx3)" py="sm" ta="center">
                    {searchQuery
                        ? "No meals match your search."
                        : "No past meals found."}
                </Text>
            ) : (
                <Group gap="xs" role="list" aria-label="Past meals">
                    {filteredPastMeals.map((title) => {
                        const added = isAdded(title);
                        return (
                            <Button
                                key={title}
                                role="listitem"
                                variant={added ? "light" : "default"}
                                size="sm"
                                h={34}
                                px="md"
                                fw={500}
                                maw="100%"
                                leftSection={
                                    added ? (
                                        <Check size={13} />
                                    ) : (
                                        <Plus size={13} />
                                    )
                                }
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
                                styles={{
                                    root: {
                                        border: added
                                            ? "1px solid color-mix(in srgb, var(--ac) 35%, transparent)"
                                            : undefined,
                                    },
                                    label: {
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    },
                                }}
                            >
                                {title}
                            </Button>
                        );
                    })}
                </Group>
            )}
        </Stack>
    );
}
