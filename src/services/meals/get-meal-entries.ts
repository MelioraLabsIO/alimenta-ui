import { getMeals } from "@/repositories/meals/get-meals";

export async function getAllMealsService() {
    return await getMeals();
}