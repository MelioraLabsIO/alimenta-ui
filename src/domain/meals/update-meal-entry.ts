import {MealFormValues} from "@/core/meals/types";
import {updateMealEntryRepository} from "@/repositories/meals/update-meal-entry";
import {createClient} from "@/lib/supabase/server";

export async function updateMealEntry(mealId: string, meal: MealFormValues) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User not authenticated");
    }

    return await updateMealEntryRepository(mealId, meal, user.id);
}

