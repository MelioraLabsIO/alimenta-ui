"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/mantine/ui";
import { Autocomplete } from "@/components/foods/autocomplete";
import type { FoodSearchItem } from "@/apis/food/queries";

export const MAX_WHEEL_SEGMENTS = 10;

interface MealEntryFormProps {
    canAddMore: boolean;
    onAdd: (label: string) => void;
}

/**
 * Card that lets the user search the food catalog or type a free-form meal
 * name to add a segment to the wheel. Shared by Personal and Shared modes.
 */
export function MealEntryForm({ canAddMore, onAdd }: MealEntryFormProps) {
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
        <Card className="border-border/50 bg-card/60">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Plus className="h-4 w-4 text-primary" />
                    Add meal manually
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex gap-2 items-start">
                    <div className="flex-1 min-w-0">
                        <Autocomplete
                            key={autocompleteKey}
                            value={selectedFood}
                            onChange={handleFoodSelect}
                            onInputChange={setTypedInput}
                            placeholder="Search or type a meal name…"
                        />
                    </div>
                    <Button
                        onClick={handleAddTyped}
                        disabled={!typedInput.trim() || !canAddMore}
                        size="sm"
                        className="shrink-0 mt-0.5"
                        aria-label="Add typed meal to wheel"
                    >
                        <Plus className="h-4 w-4" />
                        Add
                    </Button>
                </div>
                {!canAddMore && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                        Maximum {MAX_WHEEL_SEGMENTS} segments reached.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
