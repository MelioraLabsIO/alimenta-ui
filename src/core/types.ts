// src/core/types.ts

export enum EMealType {
    BREAKFAST = "BREAKFAST",
    LUNCH = "LUNCH",
    DINNER = "DINNER",
    SNACK = "SNACK",
    OTHER = "OTHER"
}

export type CatalogFood = {
    id: string;
    name: string;
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
};

export type MealItem = {
    id: string;
    mealId: string;
    catalogFoodId: string;
    quantity: number;
    unit: string;
    catalogFood: CatalogFood;
};

export type Meal = {
    id: string;
    userId?: string;
    title: string;
    type: EMealType;
    foodTime?: string | Date;
    notes?: string | null;
    mood?: number;
    energy?: number;
    digestion?: number;
    items?: MealItem[];
    createdAt?: string | Date | null;
    updatedAt?: string | Date | null;

    // Optional UI-specific convenience fields (can be calculated)
    nutrition?: NutritionSummary;
};

export type NutritionSummary = {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
};

// --- Legacy / Derived Types ---
// Keeping FoodItem for now if needed by other components, but marking as derived
export type FoodItem = {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    catalogFood?: CatalogFood;
};


export type ParsedMeal = {
    title: string;
    foods: FoodItem[];
    nutrition: NutritionSummary;
    confidence: number; // 0–1
    rawText: string;
};
