import { getMeals } from "@/repositories/meals/get-meals";
import {createClient} from "@/lib/supabase/server";

export async function getAllMealsService(from?: Date, to?: Date) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return getMeals(user?.id, from, to);
}