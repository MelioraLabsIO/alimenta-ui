import {
    COOKING_TIME_PREFERENCES,
    type CookingTimePreference,
    DIET_TYPES,
    type DietType,
    FOOD_DONENESS_LEVELS,
    type FoodDoneness,
    type FoodPreferences,
    type UserProfile,
} from "@/core/types/models/profile";
import { CUISINES } from "./cuisines";

/** The API's limits on allergies, dislikes and favorite cuisines. */
export const MAX_PREFERENCE_ITEMS = 50;
export const MAX_PREFERENCE_ITEM_LENGTH = 255;

export const DIET_TYPE_LABELS: Record<DietType, string> = {
    balanced: "Balanced",
    high_protein: "High protein",
    low_carb: "Low carb",
    keto: "Keto",
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    pescatarian: "Pescatarian",
    mediterranean: "Mediterranean",
};

export const COOKING_TIME_LABELS: Record<CookingTimePreference, string> = {
    quick: "Quick",
    normal: "Normal",
};

export const FOOD_DONENESS_LABELS: Record<FoodDoneness, string> = {
    raw: "Raw",
    almost_raw: "Almost raw",
    balanced: "Balanced",
    well_done: "Well done",
};

const CUISINE_NAMES = new Map(
    CUISINES.map((cuisine) => [cuisine.name.toLowerCase(), cuisine.name])
);

/** The cuisine's name as the API spells it, or `null` if it isn't one. */
export function findCuisineName(name: string): string | null {
    return CUISINE_NAMES.get(name.trim().toLowerCase()) ?? null;
}

/** Cuisines grouped by region, for a grouped select. */
export const CUISINE_OPTIONS = Object.entries(
    CUISINES.reduce<Record<string, string[]>>((groups, cuisine) => {
        (groups[cuisine.region] ??= []).push(cuisine.name);
        return groups;
    }, {})
)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group, items]) => ({ group, items }));

/** Whether `items` already holds `item`, ignoring case and spacing. */
export function hasItem(items: string[], item: string): boolean {
    const key = item.trim().toLowerCase();
    return items.some((current) => current.trim().toLowerCase() === key);
}

/** Trims every item and drops blanks and case-insensitive repeats. */
export function uniqueItems(items: string[]): string[] {
    const out: string[] = [];
    for (const raw of items) {
        const item = raw.trim();
        if (item && !hasItem(out, item)) out.push(item);
    }
    return out;
}

function pick<T extends string>(
    allowed: readonly T[],
    value: unknown
): T | null {
    return typeof value === "string" && allowed.includes(value as T)
        ? (value as T)
        : null;
}

function list(value: unknown): string[] {
    return Array.isArray(value)
        ? value.filter((item): item is string => typeof item === "string")
        : [];
}

/**
 * Fills in the food preferences on a profile from the API, so callers can
 * rely on arrays and `null`s even against an API that doesn't send them yet
 * (alimenta-api before PD-130).
 */
export function withFoodPreferences<
    T extends Omit<UserProfile, keyof FoodPreferences>,
>(
    profile: T & Partial<Record<keyof FoodPreferences, unknown>>
): Omit<T, keyof FoodPreferences> & FoodPreferences {
    return {
        ...profile,
        dietType: pick(DIET_TYPES, profile.dietType),
        cookingTimePreference: pick(
            COOKING_TIME_PREFERENCES,
            profile.cookingTimePreference
        ),
        foodDoneness: pick(FOOD_DONENESS_LEVELS, profile.foodDoneness),
        allergies: list(profile.allergies),
        dislikes: list(profile.dislikes),
        favoriteCuisines: list(profile.favoriteCuisines),
    };
}
