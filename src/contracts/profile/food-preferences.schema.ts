import { z } from "zod";
import {
    COOKING_TIME_PREFERENCES,
    DIET_TYPES,
    FOOD_DONENESS_LEVELS,
    type FoodPreferences,
    type FoodPreferencesUpdate,
} from "@/core/types/models/profile";
import {
    findCuisineName,
    MAX_PREFERENCE_ITEM_LENGTH,
    MAX_PREFERENCE_ITEMS,
    uniqueItems,
} from "@/lib/food-preferences";

const foodList = (label: string) =>
    z
        .array(
            z
                .string()
                .trim()
                .min(1, `${label} can't have blank items`)
                .max(
                    MAX_PREFERENCE_ITEM_LENGTH,
                    `Each item can be at most ${MAX_PREFERENCE_ITEM_LENGTH} characters`
                )
        )
        .max(
            MAX_PREFERENCE_ITEMS,
            `You can add at most ${MAX_PREFERENCE_ITEMS} ${label.toLowerCase()}`
        );

export const NO_ALLERGIES_MESSAGE =
    'Add at least one allergy, or tick "I have no food allergies".';

/**
 * The "Food preferences" form (PD-129). Allergies are the one mandatory
 * field (PD-106): the user either lists at least one or says they have none.
 * Everything else is optional and can be left blank.
 */
export const foodPreferencesSchema = z
    .object({
        allergies: foodList("Allergies"),
        noAllergies: z.boolean(),
        dislikes: foodList("Dislikes"),
        dietType: z.enum(DIET_TYPES).nullable(),
        cookingTimePreference: z.enum(COOKING_TIME_PREFERENCES).nullable(),
        foodDoneness: z.enum(FOOD_DONENESS_LEVELS).nullable(),
        favoriteCuisines: z
            .array(
                z.string().refine((name) => findCuisineName(name) !== null, {
                    message: "Pick cuisines from the list",
                })
            )
            .max(
                MAX_PREFERENCE_ITEMS,
                `You can pick at most ${MAX_PREFERENCE_ITEMS} cuisines`
            ),
    })
    .superRefine((values, ctx) => {
        if (values.allergies.length === 0 && !values.noAllergies) {
            ctx.addIssue({
                code: "custom",
                path: ["allergies"],
                message: NO_ALLERGIES_MESSAGE,
            });
        }
    });

export type FoodPreferencesInput = z.input<typeof foodPreferencesSchema>;
export type FoodPreferencesValues = z.output<typeof foodPreferencesSchema>;

/** Form values for a profile's saved preferences. */
export function toFoodPreferencesFormValues(
    preferences: FoodPreferences
): FoodPreferencesInput {
    return {
        allergies: [...preferences.allergies],
        // The API can't tell "no allergies" from "not answered yet", so the
        // box starts unticked and is asked again while the list is empty.
        noAllergies: false,
        dislikes: [...preferences.dislikes],
        dietType: preferences.dietType,
        cookingTimePreference: preferences.cookingTimePreference,
        foodDoneness: preferences.foodDoneness,
        favoriteCuisines: [...preferences.favoriteCuisines],
    };
}

/**
 * The `PATCH /api/v1/profile` body for a valid form: every preference is
 * sent, a blank single choice as `""` so the API clears it. "No allergies"
 * is saved as an empty allergy list.
 */
export function toFoodPreferencesUpdate(
    values: FoodPreferencesValues
): Required<FoodPreferencesUpdate> {
    return {
        allergies: uniqueItems(values.allergies),
        dislikes: uniqueItems(values.dislikes),
        dietType: values.dietType ?? "",
        cookingTimePreference: values.cookingTimePreference ?? "",
        foodDoneness: values.foodDoneness ?? "",
        favoriteCuisines: uniqueItems(
            values.favoriteCuisines.map((name) => findCuisineName(name) ?? name)
        ),
    };
}
