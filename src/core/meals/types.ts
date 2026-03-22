import {MealType} from "@/core/types";

export type FoodRow = { id: string; name: string; quantity: string; unit: string };
export type MealFormValues = {
    title: string;
    date: string;
    mealType: MealType;
    foods: FoodRow[];
    nutrition: {
        calories: string;
        protein: string;
        carbs: string;
        fat: string;
    };
    mood: number;
    energy: number;
    digestion: number;
    notes: string;
}