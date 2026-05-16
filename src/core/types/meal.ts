import { NutritionSummary } from "./nutrition";

export enum EMealType {
    BREAKFAST = "BREAKFAST",
    LUNCH = "LUNCH",
    DINNER = "DINNER",
    SNACK = "SNACK",
    OTHER = "OTHER"
}

export type MealItem = {
    id: string;
    mealId: string;
    catalogFoodId: string;
    quantity: number;
    unit: string;
    catalogFood: import("./food").CatalogFood;
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
    likeness?: number;
    items?: MealItem[];
    createdAt?: string | Date | null;
    updatedAt?: string | Date | null;

    // Optional UI-specific convenience fields (can be calculated)
    nutrition?: NutritionSummary;
};

export type FoodItem = {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    catalogFood?: import("./food").CatalogFood;
};

export type ParsedMeal = {
    title: string;
    foods: FoodItem[];
    nutrition: NutritionSummary;
    confidence: number; // 0–1
    rawText: string;
};

export type MealRange = "this-week" | "this-month" | "last-week" | "last-month";

export interface CaloriesAverageResponse {
    average: number;
    period: MealRange;
}
