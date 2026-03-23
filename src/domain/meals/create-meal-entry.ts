import {MealFormValues} from "@/core/meals/types";
import {createMealEntryRepository} from "@/repositories/meals/create-meal-entry";
import {createClient} from "@/lib/supabase/server";

export async function createMealEntry(meal: MealFormValues) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User not authenticated");
    }

    return await createMealEntryRepository(meal, user.id);
}