"use client";

import {useEffect, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {Badge, Combobox, Loader, Text, TextInput, useCombobox} from "@mantine/core";
import {Search} from "lucide-react";

import {searchFoods} from "@/services/food/queries";
import type {FoodSearchItem} from "@/services/food/queries";

type AutocompleteProps = {
    value?: FoodSearchItem | null;
    error?: boolean;
    placeholder?: string;
    debounceMs?: number;
    minQueryLength?: number;
    onChange: (food: FoodSearchItem) => void;
    onInputChange?: (value: string) => void;
};

function useDebouncedValue(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay);

        return () => window.clearTimeout(timeoutId);
    }, [delay, value]);

    return debouncedValue;
}

export function Autocomplete({
                                 value,
                                 error,
                                 placeholder = "Search catalog foods",
                                 debounceMs = 350,
                                 minQueryLength = 2,
                                 onChange,
                                 onInputChange,
                             }: AutocompleteProps) {
    const [search, setSearch] = useState(value?.name ?? "");
    const debouncedSearch = useDebouncedValue(search.trim(), debounceMs);
    const shouldSearch = debouncedSearch.length >= minQueryLength;
    const combobox = useCombobox();

    useEffect(() => {
        setSearch(value?.name ?? "");
    }, [value?.id, value?.name]);

    const {data = [], isFetching, isError} = useQuery({
        queryKey: ["foods", "manual-autocomplete", debouncedSearch],
        queryFn: () => searchFoods(debouncedSearch),
        enabled: shouldSearch,
        staleTime: 60_000,
    });

    const options = data.map((food) => (
        <Combobox.Option value={food.id} key={food.id}>
            <div className="flex min-w-0 items-center justify-between gap-3">
                <div className="min-w-0">
                    <Text size="sm" fw={500} truncate>
                        {food.name}
                    </Text>
                    <Text size="xs" c="dimmed" truncate>
                        {food.brandName ?? "Generic food"}
                        {typeof food.caloriesPer100g === "number" ? ` · ${food.caloriesPer100g} kcal / 100g` : ""}
                    </Text>
                </div>
                {food.source && (
                    <Badge size="xs" variant="light" color="alimenta" className="shrink-0">
                        {food.source}
                    </Badge>
                )}
            </div>
        </Combobox.Option>
    ));

    return (
        <Combobox
            store={combobox}
            withinPortal
            onOptionSubmit={(foodId) => {
                const food = data.find((item) => item.id === foodId);
                if (!food) return;

                onChange(food);
                setSearch(food.name);
                onInputChange?.("");
                combobox.closeDropdown();
            }}
        >
            <Combobox.Target>
                <TextInput
                    value={search}
                    error={error}
                    placeholder={placeholder}
                    leftSection={<Search className="h-4 w-4 text-muted-foreground"/>}
                    rightSection={isFetching ? <Loader size={16}/> : null}
                    onChange={(event) => {
                        setSearch(event.currentTarget.value);
                        onInputChange?.(event.currentTarget.value);
                        combobox.openDropdown();
                        combobox.updateSelectedOptionIndex();
                    }}
                    onFocus={() => combobox.openDropdown()}
                    onBlur={() => combobox.closeDropdown()}
                />
            </Combobox.Target>

            <Combobox.Dropdown>
                <Combobox.Options mah={260} style={{overflowY: "auto"}}>
                    {search.trim().length === 0 && (
                        <Combobox.Empty>Start typing to search foods.</Combobox.Empty>
                    )}
                    {search.trim().length > 0 && !shouldSearch && (
                        <Combobox.Empty>Type at least {minQueryLength} characters.</Combobox.Empty>
                    )}
                    {shouldSearch && isError && (
                        <Combobox.Empty>Unable to search foods.</Combobox.Empty>
                    )}
                    {shouldSearch && !isFetching && !isError && data.length === 0 && (
                        <Combobox.Empty>No foods found.</Combobox.Empty>
                    )}
                    {options}
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
}
