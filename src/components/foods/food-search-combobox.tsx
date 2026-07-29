"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Popover, TextInput } from "@mantine/core";

import { Button } from "@/components/mantine/ui";
import { Badge } from "@/components/mantine/ui";
import { Skeleton } from "@/components/mantine/ui";
import { searchFoods } from "@/apis/food/queries";
import type { FoodSearchItem } from "@/apis/food/queries";

export type { FoodSearchItem } from "@/apis/food/queries";

type FoodSearchComboboxProps = {
    value?: FoodSearchItem | null;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    onSelect: (food: FoodSearchItem) => void;
};

function useDebouncedValue(value: string, delay = 300) {
    const [debouncedValue, setDebouncedValue] = React.useState(value);

    React.useEffect(() => {
        const timeoutId = window.setTimeout(
            () => setDebouncedValue(value),
            delay
        );

        return () => window.clearTimeout(timeoutId);
    }, [delay, value]);

    return debouncedValue;
}

export function FoodSearchCombobox({
    value,
    placeholder = "Search food...",
    searchPlaceholder = "Type a food name...",
    emptyMessage = "No food found.",
    onSelect,
}: FoodSearchComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const trimmedQuery = query.trim();
    const debouncedQuery = useDebouncedValue(trimmedQuery);
    const isDebouncing =
        trimmedQuery.length > 0 && trimmedQuery !== debouncedQuery;

    const {
        data: items = [],
        isFetching,
        isError,
    } = useQuery({
        queryKey: ["foods", "search", debouncedQuery],
        queryFn: () => searchFoods(debouncedQuery),
        enabled: open && debouncedQuery.length > 0,
        staleTime: 60_000,
    });

    const isLoading = isDebouncing || isFetching;

    return (
        <Popover
            opened={open}
            onChange={setOpen}
            width="target"
            position="bottom-start"
            withinPortal
        >
            <Popover.Target>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    onClick={() => setOpen((current) => !current)}
                    className="w-full justify-between"
                >
                    <span className="truncate text-left">
                        {value ? value.name : placeholder}
                    </span>

                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </Popover.Target>

            <Popover.Dropdown p={0}>
                <div className="border-b border-border p-2">
                    <TextInput
                        value={query}
                        onChange={(event) =>
                            setQuery(event.currentTarget.value)
                        }
                        placeholder={searchPlaceholder}
                        leftSection={<Search className="h-4 w-4 opacity-50" />}
                        autoFocus
                    />
                </div>

                <div className="max-h-72 overflow-y-auto p-1">
                    {isLoading && (
                        <div className="space-y-2 p-2">
                            <Skeleton height={40} />
                            <Skeleton height={40} />
                            <Skeleton height={40} />
                        </div>
                    )}

                    {!isLoading &&
                        debouncedQuery &&
                        (isError || items.length === 0) && (
                            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                                {isError
                                    ? "Unable to search foods."
                                    : emptyMessage}
                            </p>
                        )}

                    {!isLoading && items.length > 0 && (
                        <div>
                            <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                                Foods
                            </p>
                            {items.map((food) => (
                                <button
                                    key={food.id}
                                    type="button"
                                    onClick={() => {
                                        onSelect(food);
                                        setOpen(false);
                                        setQuery("");
                                    }}
                                    className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                                >
                                    <Check
                                        className={`h-4 w-4 shrink-0 ${value?.id === food.id ? "opacity-100" : "opacity-0"}`}
                                    />

                                    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate font-medium">
                                                {food.name}
                                            </p>

                                            <p className="truncate text-xs text-muted-foreground">
                                                {food.brandName ??
                                                    "Generic food"}
                                                {typeof food.caloriesPer100g ===
                                                    "number" &&
                                                    ` · ${food.caloriesPer100g} kcal / 100g`}
                                            </p>
                                        </div>

                                        {food.source && (
                                            <Badge
                                                variant="secondary"
                                                className="shrink-0"
                                            >
                                                {food.source}
                                            </Badge>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </Popover.Dropdown>
        </Popover>
    );
}
