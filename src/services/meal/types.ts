import {mealSchema} from "@/contracts/meals/create-meal.schema";
import {z} from "zod";
import {EMealUnit} from "@/core/types/models/meal";

export type FoodRow = { foodSourceId: string; foodName: string; foodSource: string; quantity: number; unit: EMealUnit };
export type MealFormValues = z.infer<typeof mealSchema>;
