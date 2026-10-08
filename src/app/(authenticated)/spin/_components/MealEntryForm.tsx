"use client";

import { useState, type ReactNode } from "react";
import { Box, Button, Group, Paper, Stack, Text } from "@mantine/core";
import { Plus } from "lucide-react";
import { Autocomplete } from "@/components/foods/autocomplete";
import type { FoodSearchItem } from "@/apis/food/queries";

export const MAX_WHEEL_SEGMENTS = 10;

interface MealEntryFormProps {
    canAddMore: boolean;
    onAdd: (label: string) => void;
    /** Card heading. Personal mode says "Add to the wheel", guests "Your pick". */
    title?: string;
    /**
     * Rendered under the input row, inside the same card — Personal mode
     * drops its "From your recent meals" chips in here.
     */
    children?: ReactNode;
}

/**
 * Card that lets the user search the food catalog or type a free-form meal
 * name to add a segment to the wheel. Shared by Personal and Shared modes.
 */
export function MealEntryForm({
    canAddMore,
    onAdd,
    title = "Add to the wheel",
    children,
}: MealEntryFormProps) {
    const [selectedFood, setSelectedFood] = useState<FoodSearchItem | null>(
        null
    );
    const [autocompleteKey, setAutocompleteKey] = useState(0);
    const [typedInput, setTypedInput] = useState("");

    function handleFoodSelect(food: FoodSearchItem) {
        onAdd(food.name);
        setSelectedFood(null);
        setTypedInput("");
        setAutocompleteKey((k) => k + 1);
    }

    function handleAddTyped() {
        if (!typedInput.trim() || !canAddMore) return;
        onAdd(typedInput.trim());
        setTypedInput("");
        setSelectedFood(null);
        setAutocompleteKey((k) => k + 1);
    }

    return (
        <Paper p="lg" style={{ border: "1px solid var(--bd)" }}>
            <Stack gap="md">
                <Text fw={700} fz="md">
                    {title}
                </Text>
                <Group gap="sm" align="flex-start" wrap="nowrap">
                    <Box flex={1} miw={0}>
                        <Autocomplete
                            key={autocompleteKey}
                            value={selectedFood}
                            onChange={handleFoodSelect}
                            onInputChange={setTypedInput}
                            placeholder="Type any meal…"
                        />
                    </Box>
                    <Button
                        onClick={handleAddTyped}
                        disabled={!typedInput.trim() || !canAddMore}
                        h={44}
                        px="lg"
                        radius="md"
                        leftSection={<Plus size={15} />}
                        aria-label="Add typed meal to wheel"
                        style={{ flexShrink: 0 }}
                    >
                        Add
                    </Button>
                </Group>
                {!canAddMore && (
                    <Text fz="xs" c="var(--tx3)">
                        Maximum {MAX_WHEEL_SEGMENTS} segments reached.
                    </Text>
                )}
                {children}
            </Stack>
        </Paper>
    );
}
