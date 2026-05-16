import {apiFetch} from "@/apiClient/client";
import {getSession} from "@/lib/supabase/session";
import {getMealsByRange} from "@/services/meal/queries";

async function getTopFood(): Promise<{ title: string; foodCount: number }> {
    const session = await getSession();
    console.log("session", session, "fetching top food");
    const response = await apiFetch("/api/v1/insights/top-food")
    if (!response) {
        throw new Error("Failed to fetch top food");
    }
    return response;
}


async function getAvgCaloriesPerTimeFrame() {
    return getMealsByRange("this-week");
}

async function getMealsThisWeek() {
    return getMealsByRange("this-week");
}

async function getAverageCalories() {
    return apiFetch("/api/v1/insights/average-calories");
}

export {getTopFood, getAverageCalories, getAvgCaloriesPerTimeFrame, getMealsThisWeek}
