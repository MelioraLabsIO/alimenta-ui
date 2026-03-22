import {MealFormValues} from "@/core/meals/types";

export async function logMeal(meal: MealFormValues) {
    const {title, date, mealType, foods, nutrition, mood, energy, digestion, notes} = meal
    const foodsData = foods.map(({name, quantity, unit}) => ({name, quantity: Number(quantity), unit}))
    const response = await fetch("/api/v1/log", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({title, date, mealType, foods: foodsData, nutrition, mood, energy, digestion, notes}),
    })

    if (!response.ok) {
        throw new Error("Failed to log meal")
    }

    const result = await response.json()
    return result?.data;
}
