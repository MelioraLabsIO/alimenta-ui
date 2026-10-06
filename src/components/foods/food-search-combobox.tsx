"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
    Badge,
    Box,
    Button,
    Group,
    Popover,
    Skeleton,
    Stack,
    Text,
    TextInput,
    UnstyledButton,
} from "@mantine/core";

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
                    variant="default"
                    role="combobox"
                    aria-expanded={open}
                    fullWidth
                    justify="space-between"
                    onClick={() => setOpen((current) => !current)}
                    rightSection={
                        <ChevronsUpDown size={16} style={{ opacity: 0.5 }} />
                    }
                    styles={{
                        label: { flex: 1, minWidth: 0, display: "block" },
                    }}
                >
                    <Text
                        component="span"
                        truncate
                        ta="left"
                        fz="inherit"
                        fw="inherit"
                        c={value ? "var(--tx)" : "var(--tx3)"}
                        style={{ display: "block" }}
                    >
                        {value ? value.name : placeholder}
                    </Text>
                </Button>
            </Popover.Target>

            <Popover.Dropdown p={0}>
                <Box p={8} style={{ borderBottom: "1px solid var(--bd)" }}>
                    <TextInput
                        value={query}
                        onChange={(event) =>
                            setQuery(event.currentTarget.value)
                        }
                        placeholder={searchPlaceholder}
                        leftSection={<Search size={16} />}
                        autoFocus
                    />
                </Box>

                <Box mah={288} p={4} style={{ overflowY: "auto" }}>
                    {isLoading && (
                        <Stack gap={8} p={8}>
                            <Skeleton height={40} />
                            <Skeleton height={40} />
                            <Skeleton height={40} />
                        </Stack>
                    )}

                    {!isLoading &&
                        debouncedQuery &&
                        (isError || items.length === 0) && (
                            <Text
                                px={12}
                                py={24}
                                ta="center"
                                fz="sm"
                                c="var(--tx3)"
                            >
                                {isError
                                    ? "Unable to search foods."
                                    : emptyMessage}
                            </Text>
                        )}

                    {!isLoading && items.length > 0 && (
                        <Box>
                            <Text px={8} py={4} fz={12} fw={500} c="var(--tx3)">
                                Foods
                            </Text>
                            {items.map((food) => (
                                <UnstyledButton
                                    key={food.id}
                                    type="button"
                                    w="100%"
                                    px={8}
                                    py={8}
                                    onClick={() => {
                                        onSelect(food);
                                        setOpen(false);
                                        setQuery("");
                                    }}
                                    style={{ borderRadius: 10 }}
                                >
                                    <Group gap={8} wrap="nowrap">
                                        <Box
                                            style={{
                                                display: "flex",
                                                flexShrink: 0,
                                                opacity:
                                                    value?.id === food.id
                                                        ? 1
                                                        : 0,
                                            }}
                                        >
                                            <Check size={16} />
                                        </Box>

                                        <Group
                                            justify="space-between"
                                            gap={12}
                                            wrap="nowrap"
                                            miw={0}
                                            style={{ flex: 1 }}
                                        >
                                            <Box miw={0}>
                                                <Text fz="sm" fw={500} truncate>
                                                    {food.name}
                                                </Text>

                                                <Text
                                                    fz={12}
                                                    c="var(--tx3)"
                                                    truncate
                                                >
                                                    {food.brandName ??
                                                        "Generic food"}
                                                    {typeof food.caloriesPer100g ===
                                                        "number" &&
                                                        ` · ${food.caloriesPer100g} kcal / 100g`}
                                                </Text>
                                            </Box>

                                            {food.source && (
                                                <Badge
                                                    variant="surface"
                                                    style={{ flexShrink: 0 }}
                                                >
                                                    {food.source}
                                                </Badge>
                                            )}
                                        </Group>
                                    </Group>
                                </UnstyledButton>
                            ))}
                        </Box>
                    )}
                </Box>
            </Popover.Dropdown>
        </Popover>
    );
}
