import {mealSchema} from "@/contracts/meals/create-meal.schema";
import {z} from "zod";

export type FoodRow = { id: string; name: string; quantity: string; unit: string };
export type MealFormValues = z.infer<typeof mealSchema>;