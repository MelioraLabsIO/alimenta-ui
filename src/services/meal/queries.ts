import {Meal, MealRange, CaloriesAverageResponse} from "@/core/types/meal";
import {apiFetch} from "@/apiClient/client";

export async function getRecentMeals(): Promise<Meal[]> {
    return apiFetch("/api/v1/meals?limit=5");
}

export async function getAllMeals(): Promise<Meal[]> {
    return apiFetch("/api/v1/meals");
}

export function getDateRange(range: MealRange): { from: Date; to: Date } {
    const now = new Date();

    if (range === "this-week") {
        const day = now.getDay(); // 0 = Sunday
        const diffToMonday = day === 0 ? -6 : 1 - day;
        const from = new Date(now);
        from.setDate(now.getDate() + diffToMonday);
        from.setHours(0, 0, 0, 0);
        const to = new Date(from);
        to.setDate(from.getDate() + 6);
        to.setHours(23, 59, 59, 999);
        return { from, to };
    }

    if (range === "last-week") {
        const day = now.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;
        const to = new Date(now);
        to.setDate(now.getDate() + diffToMonday - 1);
        to.setHours(23, 59, 59, 999);
        const from = new Date(to);
        from.setDate(to.getDate() - 6);
        from.setHours(0, 0, 0, 0);
        return { from, to };
    }

    if (range === "this-month") {
        const from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        return { from, to };
    }

    // last-month
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { from, to };
}

export async function getMealsByRange(range: MealRange = "this-week"): Promise<Meal[]> {
    const { from, to } = getDateRange(range);
    const params = new URLSearchParams({
        from: from.toISOString(),
        to: to.toISOString(),
    });
    return apiFetch(`/api/v1/meals?${params.toString()}`);
}

export async function getCaloriesAverage(): Promise<CaloriesAverageResponse> {
    return apiFetch("/api/v1/meals/calories-average");
}
