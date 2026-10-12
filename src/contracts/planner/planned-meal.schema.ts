import { z } from "zod";
import { PLANNER_SLOTS } from "@/core/types/models/planner";

export const plannedMealSchema = z.object({
    name: z.string().trim().min(1, "Give the meal a name"),
    slot: z.enum(PLANNER_SLOTS as [string, ...string[]]),
    kcal: z.coerce
        .number({ message: "Enter the estimated calories" })
        .int("Use a whole number")
        .min(0, "Calories can't be negative")
        .max(5000, "That's more than 5,000 kcal"),
});

export type PlannedMealInput = z.input<typeof plannedMealSchema>;
export type PlannedMealSchema = z.output<typeof plannedMealSchema>;
