import {EMealUnit, Meal, ParsedMeal} from "@/core/types/models/meal";
import {apiFetch} from "@/apiClient/client";
import {aiClient} from "@/domain/ai/aiClient";
import {SaveMealDTO} from "@/core/types/dto/save-meal.dto";

export type AnalyzeInput = {
    text: string;
    userId?: string;
};

export type DeleteMealResponse = {
    id: string;
};

export type BulkDeleteMealsResponse = {
    ids: string[];
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

    // Transform the AI response to ParsedMeal structure
    return {
        title: input.text.slice(0, 30),
        items: aiResponse.items.map((foodName: string) => ({
            id: Math.random().toString(36).substring(2, 9),
            name: foodName,
            quantity: 1,
        unit: EMealUnit.GRAM,
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

export async function saveMeal(meal: SaveMealDTO): Promise<Meal> {
    const result = await apiFetch<{data: Meal}>("/api/v1/meals", {
        method: "POST",
        body: JSON.stringify(meal),
    });
    return result?.data;
}

export async function updateMeal(
    mealId: string,
    meal: SaveMealDTO
): Promise<Meal> {
    const result = await apiFetch<{data: Meal}>(`/api/v1/meals/${mealId}`, {
        method: "PUT",
        body: JSON.stringify(meal),
    });
    return result?.data;
}

export async function deleteMealById(id: string): Promise<DeleteMealResponse> {
    return apiFetch(`/api/v1/meals/${id}`, {
        method: "DELETE",
    });
}

export async function bulkDeleteMeals(
    ids: string[]
): Promise<BulkDeleteMealsResponse> {
    return apiFetch("/api/v1/meals/bulk-delete", {
        method: "POST",
        body: JSON.stringify({ids}),
    });
}

export interface ExtractedIngredient {
    name: string;
    quantity: number | null;
    unit: string | null;
    preparation: string | null;
    quantitySource: string;
}

export interface MealDraft {
    mealName: string;
    mealType: string;
    ingredients: ExtractedIngredient[];
    assumptions: string[];
    clarificationQuestions: string[];
}

export async function extractMeal(mealDescription: string): Promise<MealDraft> {
    const result = await apiFetch<MealDraft | {data: MealDraft}>(`/api/v1/meals/extract-meal`, {
        method: "POST",
        body: JSON.stringify({description: mealDescription}),
    })

    return "data" in result ? result.data : result;
}
