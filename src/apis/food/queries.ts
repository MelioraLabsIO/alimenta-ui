import {apiFetch} from "@/apiClient/client";

export type FoodSearchItem = {
    id: string;
    name: string;
    brandName?: string | null;
    caloriesPer100g?: number | null;
    source?: "USDA" | "CUSTOM" | "AI" | string;
};

export async function searchFoods(query: string): Promise<FoodSearchItem[]> {
    const params = new URLSearchParams({q: query});
    const response = await apiFetch<FoodSearchItem[] | {data?: FoodSearchItem[]}>(`/api/v1/foods/search?${params.toString()}`);

    return Array.isArray(response) ? response : response?.data ?? [];
}
