/** Diet types the API accepts (alimenta-api `domain.DietTypes`). */
export const DIET_TYPES = [
    "balanced",
    "high_protein",
    "low_carb",
    "keto",
    "vegetarian",
    "vegan",
    "pescatarian",
    "mediterranean",
] as const;

/** Cooking time preferences the API accepts. */
export const COOKING_TIME_PREFERENCES = ["quick", "normal"] as const;

/** Food doneness levels the API accepts. */
export const FOOD_DONENESS_LEVELS = [
    "raw",
    "almost_raw",
    "balanced",
    "well_done",
] as const;

export type DietType = (typeof DIET_TYPES)[number];
export type CookingTimePreference = (typeof COOKING_TIME_PREFERENCES)[number];
export type FoodDoneness = (typeof FOOD_DONENESS_LEVELS)[number];

/** The PD-106 food preferences as `GET /api/v1/profile` returns them. */
export interface FoodPreferences {
    /** `null` until the user picks one. */
    dietType: DietType | null;
    cookingTimePreference: CookingTimePreference | null;
    foodDoneness: FoodDoneness | null;
    allergies: string[];
    dislikes: string[];
    /** Cuisine names from the API's cuisine list. */
    favoriteCuisines: string[];
}

export interface UserProfile extends FoodPreferences {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

/**
 * A profile write may change any subset of the food preferences. An omitted
 * field is left as it is, an empty string clears a single choice and an
 * empty list clears a list.
 */
export type FoodPreferencesUpdate = {
    dietType?: DietType | "";
    cookingTimePreference?: CookingTimePreference | "";
    foodDoneness?: FoodDoneness | "";
    allergies?: string[];
    dislikes?: string[];
    favoriteCuisines?: string[];
};
