import {EMealType, EMealUnit} from "@/core/types/models/meal";
import {z} from "zod";

export const MEAL_TYPES = [EMealType.BREAKFAST, EMealType.LUNCH, EMealType.DINNER, EMealType.SNACK, EMealType.OTHER] as const;
export const mealSchema = z.object({
    title: z.string().min(1, "Meal title is required"),
    mealTime: z.coerce.date({ message: "Date is required" }),
    type: z.enum(EMealType),
    items: z.array(z.object({
        foodSourceId: z.string().min(1, "Food source ID is required"),
        foodSource: z.string().min(1, "Food source is required"),
        foodName: z.string().min(1, "Food name is required"),
        quantity: z.coerce.number().min(0, "Quantity must be greater than 0"),
        unit: z.enum(EMealUnit).default(EMealUnit.GRAM),
    })).min(1, "At least one food item is required"),
    mood: z.number().min(1).max(5).optional(),
    energy: z.number().min(1).max(5).optional(),
    digestion: z.number().min(1).max(5).optional(),
    likeness: z.number().min(1).max(5).optional(),
    notes: z.string().optional(),
});
