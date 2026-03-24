import {createClient} from "@/lib/supabase/server";
import {deleteMealEntryRepository} from "@/repositories/meals/delete-meal-entry";

export async function deleteMealEntry(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User not authenticated");
    }

    return await deleteMealEntryRepository(id);
}