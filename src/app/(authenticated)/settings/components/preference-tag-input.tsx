"use client";

import { X } from "lucide-react";
import { Badge, Button } from "@/components/mantine/ui";
import { Autocomplete } from "@/components/foods/autocomplete";
import type { FoodSearchItem } from "@/apis/food/queries";
import { Text } from "@mantine/core";

type PreferenceTagInputProps = {
    label: string;
    placeholder: string;
    items: string[];
    selectedFood: FoodSearchItem | null;
    onSelectedFoodChangeAction: (food: FoodSearchItem) => void;
    onAddItemAction: () => void;
    onRemoveItemAction: (item: string) => void;
};

export function PreferenceTagInput({
    label,
    placeholder,
    items,
    selectedFood,
    onSelectedFoodChangeAction,
    onAddItemAction,
    onRemoveItemAction,
}: PreferenceTagInputProps) {
    return (
        <div className="space-y-2">
            <Text size={"md"}>{label}</Text>
            <div className="flex min-h-8 flex-wrap gap-2">
                {items.map((item) => (
                    <Badge
                        key={item}
                        variant="secondary"
                        className="gap-1 pr-1 text-xs"
                    >
                        {item}
                        <button
                            type="button"
                            onClick={() => onRemoveItemAction(item)}
                            className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                        >
                            <X className="h-2.5 w-2.5" />
                        </button>
                    </Badge>
                ))}
            </div>
            <div className="flex items-stretch gap-2">
                <div className="flex-1">
                    <Autocomplete
                        value={selectedFood}
                        placeholder={placeholder}
                        onChange={onSelectedFoodChangeAction}
                    />
                </div>
                <Button
                    variant="outline"
                    size="md"
                    onClick={onAddItemAction}
                    disabled={!selectedFood}
                    className="h-auto gap-1 px-3"
                >
                    Add
                </Button>
            </div>
        </div>
    );
}
