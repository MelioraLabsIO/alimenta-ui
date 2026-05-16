import {MealFormValues} from "./types";
import {Meal, ParsedMeal} from "@/core/types/meal";
import {apiFetch} from "@/apiClient/client";
import {aiClient} from "@/domain/ai/aiClient";

export type AnalyzeInput = {
    text: string;
    userId?: string;
};

/**
 * Analyzes a meal description using the AI service.
 */
export async function analyzeMeal(input: AnalyzeInput): Promise<ParsedMeal> {
    if (!input.text || input.text.length < 5) {
        throw new Error("Meal description too short.");
    }

    // Call external AI service
    const aiResponse = await aiClient.analyzeText(input.text);
    console.log("aiResponse: ", aiResponse);

    // Transform the AI response to ParsedMeal structure
    return {
        title: input.text.slice(0, 30),
        foods: aiResponse.foods.map((foodName: string) => ({
            id: Math.random().toString(36).substring(2, 9),
            name: foodName,
            quantity: 1,
            unit: "unit",
        })),
        nutrition: {
            calories: aiResponse.calories || 0,
            protein: 0,
            carbs: 0,
            fat: 0,
        },
        confidence: 1.0,
        rawText: input.text,
    };
}

export async function logMeal(meal: MealFormValues): Promise<Meal> {
    const result = await apiFetch("/api/v1/meals", {
        method: "POST",
        body: JSON.stringify(meal),
    });
    return result?.data;
}

export async function updateMeal(
    mealId: string,
    meal: MealFormValues
): Promise<Meal> {
    const result = await apiFetch(`/api/v1/meals/${mealId}`, {
        method: "PUT",
        body: JSON.stringify(meal),
    });
    return result?.data;
}

export async function deleteMealById(id: string): Promise<Meal> {
    return apiFetch(`/api/v1/meals/${id}`, {
        method: "DELETE",
    });
}

export async function bulkDeleteMeals(
    ids: string[]
): Promise<{ count: number }> {
    return apiFetch("/api/v1/meals/bulk-delete", {
        method: "DELETE",
        body: JSON.stringify({ids}),
    });
}