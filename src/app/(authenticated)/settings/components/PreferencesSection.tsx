"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Box,
    Button,
    Checkbox,
    Group,
    Loader,
    MultiSelect,
    Stack,
} from "@mantine/core";
import { Save } from "lucide-react";
import { toast } from "@/lib/notifications";
import { updateFoodPreferences } from "@/apis/profile/mutations";
import type { FoodSearchItem } from "@/apis/food/queries";
import { useProfileStore } from "@/stores/profile.store";
import {
    COOKING_TIME_PREFERENCES,
    DIET_TYPES,
    FOOD_DONENESS_LEVELS,
} from "@/core/types/models/profile";
import {
    COOKING_TIME_LABELS,
    CUISINE_OPTIONS,
    DIET_TYPE_LABELS,
    FOOD_DONENESS_LABELS,
    hasItem,
    MAX_PREFERENCE_ITEMS,
} from "@/lib/food-preferences";
import {
    type FoodPreferencesInput,
    foodPreferencesSchema,
    type FoodPreferencesValues,
    toFoodPreferencesFormValues,
    toFoodPreferencesUpdate,
} from "@/contracts/profile/food-preferences.schema";
import { ChoicePills } from "./ChoicePills";
import { PreferenceTagInput } from "./PreferenceTagInput";
import { SettingsGroup } from "./SettingsGroup";

const EMPTY_VALUES: FoodPreferencesInput = {
    allergies: [],
    noAllergies: false,
    dislikes: [],
    dietType: null,
    cookingTimePreference: null,
    foodDoneness: null,
    favoriteCuisines: [],
};

/**
 * "Food preferences" tab (PD-129): allergies (required), then the optional
 * dislikes, diet type, favorite cuisines, cooking time and doneness. Starts
 * from the saved profile and saves all six with one `PATCH /profile`.
 */
export function PreferencesSection() {
    const profile = useProfileStore((state) => state.profile);
    const setProfile = useProfileStore((state) => state.setProfile);

    const [selectedDislike, setSelectedDislike] =
        useState<FoodSearchItem | null>(null);
    const [selectedAllergy, setSelectedAllergy] =
        useState<FoodSearchItem | null>(null);

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isDirty },
    } = useForm<FoodPreferencesInput, unknown, FoodPreferencesValues>({
        resolver: zodResolver(foodPreferencesSchema),
        defaultValues: EMPTY_VALUES,
    });

    useEffect(() => {
        if (profile) reset(toFoodPreferencesFormValues(profile));
    }, [profile, reset]);

    const allergies = useWatch({ control, name: "allergies" });
    const dislikes = useWatch({ control, name: "dislikes" });

    const { mutate: save, isPending } = useMutation({
        mutationKey: ["update-food-preferences"],
        mutationFn: (values: FoodPreferencesValues) =>
            updateFoodPreferences(toFoodPreferencesUpdate(values)),
        onSuccess: (updatedProfile) => {
            setProfile(updatedProfile);
            toast.success("Preferences saved!");
        },
        onError: () => {
            toast.error("Couldn't save your preferences, please try again.");
        },
    });

    function addItem(
        field: "allergies" | "dislikes",
        food: FoodSearchItem | null,
        resetSelection: () => void
    ) {
        const item = food?.name.trim();
        const items = field === "allergies" ? allergies : dislikes;

        if (item && !hasItem(items, item)) {
            setValue(field, [...items, item], {
                shouldDirty: true,
                shouldValidate: true,
            });
            if (field === "allergies") {
                setValue("noAllergies", false, { shouldDirty: true });
            }
        }

        resetSelection();
    }

    function removeItem(field: "allergies" | "dislikes", item: string) {
        const items = field === "allergies" ? allergies : dislikes;
        setValue(
            field,
            items.filter((current) => current !== item),
            { shouldDirty: true }
        );
    }

    if (!profile) {
        return (
            <Group justify="center" py="xl">
                <Loader />
            </Group>
        );
    }

    return (
        <Box
            component="form"
            onSubmit={handleSubmit((v) => save(v))}
            noValidate
        >
            <Stack gap="xl">
                <PreferenceTagInput
                    label="Allergies"
                    requirement="required"
                    placeholder="Add an allergy"
                    accent="var(--ro)"
                    items={allergies}
                    emptyText="No allergies added"
                    error={
                        errors.allergies?.message ??
                        firstItemError(errors.allergies)
                    }
                    selectedFood={selectedAllergy}
                    onSelectedFoodChangeAction={setSelectedAllergy}
                    onAddItemAction={() =>
                        addItem("allergies", selectedAllergy, () =>
                            setSelectedAllergy(null)
                        )
                    }
                    onRemoveItemAction={(item) => removeItem("allergies", item)}
                    footer={
                        allergies.length === 0 && (
                            <Controller
                                control={control}
                                name="noAllergies"
                                render={({ field }) => (
                                    <Checkbox
                                        mt="md"
                                        label="I have no food allergies"
                                        checked={field.value}
                                        onChange={(event) =>
                                            field.onChange(
                                                event.currentTarget.checked
                                            )
                                        }
                                    />
                                )}
                            />
                        )
                    }
                />

                <PreferenceTagInput
                    label="Dislikes"
                    requirement="optional"
                    placeholder="Add a food you avoid"
                    accent="var(--am)"
                    items={dislikes}
                    error={
                        errors.dislikes?.message ??
                        firstItemError(errors.dislikes)
                    }
                    selectedFood={selectedDislike}
                    onSelectedFoodChangeAction={setSelectedDislike}
                    onAddItemAction={() =>
                        addItem("dislikes", selectedDislike, () =>
                            setSelectedDislike(null)
                        )
                    }
                    onRemoveItemAction={(item) => removeItem("dislikes", item)}
                />

                <Controller
                    control={control}
                    name="dietType"
                    render={({ field }) => (
                        <ChoicePills
                            label="Diet type"
                            options={DIET_TYPES}
                            labels={DIET_TYPE_LABELS}
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="favoriteCuisines"
                    render={({ field }) => (
                        <SettingsGroup
                            label="Favorite cuisines"
                            requirement="optional"
                            error={
                                errors.favoriteCuisines?.message ??
                                firstItemError(errors.favoriteCuisines)
                            }
                            padded
                        >
                            <MultiSelect
                                aria-label="Favorite cuisines"
                                placeholder={
                                    field.value.length
                                        ? undefined
                                        : "Search cuisines, e.g. Cuban or Italian"
                                }
                                data={CUISINE_OPTIONS}
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                searchable
                                clearable
                                hidePickedOptions
                                maxValues={MAX_PREFERENCE_ITEMS}
                                nothingFoundMessage="No cuisine by that name"
                                comboboxProps={{ withinPortal: true }}
                            />
                        </SettingsGroup>
                    )}
                />

                <Controller
                    control={control}
                    name="cookingTimePreference"
                    render={({ field }) => (
                        <ChoicePills
                            label="Cooking time"
                            options={COOKING_TIME_PREFERENCES}
                            labels={COOKING_TIME_LABELS}
                            value={field.value}
                            onChange={field.onChange}
                            accent="var(--bl)"
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="foodDoneness"
                    render={({ field }) => (
                        <ChoicePills
                            label="Food doneness"
                            options={FOOD_DONENESS_LEVELS}
                            labels={FOOD_DONENESS_LABELS}
                            value={field.value}
                            onChange={field.onChange}
                            accent="var(--am)"
                        />
                    )}
                />

                <Group>
                    <Button
                        type="submit"
                        h={40}
                        px="lg"
                        disabled={!isDirty}
                        loading={isPending}
                        leftSection={<Save size={15} />}
                    >
                        Save preferences
                    </Button>
                </Group>
            </Stack>
        </Box>
    );
}

/** The first per-item message on a list field, e.g. an over-long name. */
function firstItemError(error: unknown): string | undefined {
    if (!Array.isArray(error)) return undefined;

    for (const item of error) {
        if (item && typeof item.message === "string") return item.message;
    }

    return undefined;
}
