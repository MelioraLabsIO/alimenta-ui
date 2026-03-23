import {MealFormValues} from "@/core/meals/types";

export async function logMeal(meal: MealFormValues) {
    const response = await fetch("/api/v1/meals", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(meal),
    })

    if (!response.ok) {
        throw new Error("Failed to log meal")
    }

    const result = await response.json()
    return result?.data;
}
