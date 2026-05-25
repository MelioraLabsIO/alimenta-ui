import {NutritionSummary} from "./nutrition";
import {CatalogFood} from "@/core/types/models/food";

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
    foodSource: string;
    foodSourceId: string;
    foodName: string;
    brand?: string;
    quantity: number;
    unit: EMealUnit;
    nutrition: NutritionSummary;
    createdAt: Date;
    updatedAt: Date;

};

export type Meal = {
    id: string;
    userId: string;
    title: string;
    type: EMealType;
    notes?: string;
    mood?: number;
    energy?: number;
    digestion?: number;
    likeness?: number;
    items: MealItem[];
    mealTime: Date;
    createdAt: Date;
    updatedAt: Date;
    nutrition: NutritionSummary;
};

export type FoodItem = {
    id: string;
    catalogFoodId: string;
    quantity: number;
    unit: EMealUnit;
    catalogFood?: CatalogFood;
};

export type ParsedMeal = {
    title: string;
    items: FoodItem[];
    nutrition: NutritionSummary;
    confidence: number; // 0–1
    rawText: string;
};

export type MealRange = "this-week" | "this-month" | "last-week" | "last-month";

export interface CaloriesAverageResponse {
    average: number;
    period: MealRange;
}

export enum EMealUnit {
    GRAM = "g",
    ML = "ml",
    CUP = "cup",
    OZ = "oz",
    LB = "lb",
    KG = "kg",
    UNIT = "unit",
    TABLESPOON = "tbsp",
    TEASPOON = "tsp",
    PIECE = "piece",
    SLICE = "slice",
    SERVING = "serving",
    WHOLE = "whole",
    LARGE = "large",
    MEDIUM = "medium",
    SMALL = "small",

}
