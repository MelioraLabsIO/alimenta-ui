import {EMealType, EMealUnit} from "@/core/types/models/meal";

export type MealResponse = {
    id: string;
    userId: string;
    title: string;
    type: EMealType;
    notes?: string
    // Behavioral
    mood?: number;
    energy?: number ;
    digestion?: number ;
    likeness?: number ;
    // Others
    items: MealItemResponse[];
    nutrition: NutritionSummaryResponse
    // Time Stamp
    mealTime: Date;
    createdAt: Date;
    updatedAt: Date;
};



export type NutritionSummaryResponse = {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugars?: number;
};

export type MealItemResponse = {
    id: string;
    mealId: string;
    quantity: number;
    unit: EMealUnit;
    foodSource: string; // catalog | custom
    foodSourceId: string; // UUID like
    foodName: string;
    brand?: string;
    nutrition: NutritionSummaryResponse;
    createdAt: Date
    updatedAt: Date
};
