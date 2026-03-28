import {EMealType} from "@/core/types";
import {z} from "zod";

export const MEAL_TYPES = [EMealType.BREAKFAST, EMealType.LUNCH, EMealType.DINNER, EMealType.SNACK, EMealType.OTHER] as const;
export const mealSchema = z.object({
    title: z.string().min(1, "Meal title is required"),
    date: z.string().min(1, "Date is required"),
    mealType: z.nativeEnum(EMealType),
    foods: z.array(z.object({
        id: z.string(),
        name: z.string().min(1, "Food name is required"),
        quantity: z.string(),
        unit: z.string(),
    })).min(1, "At least one food item is required"),
    nutrition: z.object({
        calories: z.string(),
        protein: z.string(),
        carbs: z.string(),
        fat: z.string(),
    }),
    mood: z.number().min(1).max(5),
    energy: z.number().min(1).max(5),
    digestion: z.number().min(1).max(5),
    notes: z.string(),
});