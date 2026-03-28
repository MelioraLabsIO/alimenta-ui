import {MealFormValues} from "@/core/meals/types";
import {Meal} from "@/core/types";

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

export async function updateMeal(mealId: string, meal: MealFormValues) {
    const response = await fetch(`/api/v1/meals/${mealId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(meal),
    })

    if (!response.ok) {
        throw new Error("Failed to update meal")
    }

    const result = await response.json()
    return result?.data;
}

export async function deleteMealById(id: string): Promise<Meal> {
    const response = await fetch(`/api/v1/meals/${id}`, {
        method: "DELETE",
    })

    if (!response.ok) {
        throw new Error("Failed to delete meal")
    }

    return response.json()
}