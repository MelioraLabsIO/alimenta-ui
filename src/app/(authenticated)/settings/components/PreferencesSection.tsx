"use client";

import { useState } from "react";
import { Button, Group, Stack } from "@mantine/core";
import { toast } from "@/lib/notifications";
import { PreferenceTagInput } from "./PreferenceTagInput";
import type { FoodSearchItem } from "@/apis/food/queries";

/** "Food preferences" tab: dislikes and allergies. */
export function PreferencesSection({
    dislikes,
    allergies,
    onDislikesChange,
    onAllergiesChange,
}: {
    dislikes: string[];
    allergies: string[];
    onDislikesChange: (items: string[]) => void;
    onAllergiesChange: (items: string[]) => void;
}) {
    const [selectedDislike, setSelectedDislike] =
        useState<FoodSearchItem | null>(null);
    const [selectedAllergy, setSelectedAllergy] =
        useState<FoodSearchItem | null>(null);

    function addItem(
        selectedFood: FoodSearchItem | null,
        items: string[],
        onUpdateItems: (items: string[]) => void,
        onResetSelection: () => void
    ) {
        const item = selectedFood?.name.trim();

        if (item && !items.includes(item)) {
            onUpdateItems([...items, item]);
        }

        onResetSelection();
    }

    function removeItem(
        item: string,
        items: string[],
        onUpdateItems: (items: string[]) => void
    ) {
        onUpdateItems(items.filter((currentItem) => currentItem !== item));
    }

    function handleSavePreferences() {
        toast.success("Preferences saved!");
    }

    return (
        <Stack gap="xl">
            <PreferenceTagInput
                label="Dislikes"
                placeholder="Add a food you avoid"
                accent="var(--am)"
                items={dislikes}
                selectedFood={selectedDislike}
                onSelectedFoodChangeAction={setSelectedDislike}
                onAddItemAction={() =>
                    addItem(selectedDislike, dislikes, onDislikesChange, () =>
                        setSelectedDislike(null)
                    )
                }
                onRemoveItemAction={(item) =>
                    removeItem(item, dislikes, onDislikesChange)
                }
            />
            <PreferenceTagInput
                label="Allergies"
                placeholder="Add an allergy"
                accent="var(--ro)"
                items={allergies}
                selectedFood={selectedAllergy}
                onSelectedFoodChangeAction={setSelectedAllergy}
                onAddItemAction={() =>
                    addItem(selectedAllergy, allergies, onAllergiesChange, () =>
                        setSelectedAllergy(null)
                    )
                }
                onRemoveItemAction={(item) =>
                    removeItem(item, allergies, onAllergiesChange)
                }
            />

            <Group>
                <Button type="button" size="sm" onClick={handleSavePreferences}>
                    Save preferences
                </Button>
            </Group>
        </Stack>
    );
}
