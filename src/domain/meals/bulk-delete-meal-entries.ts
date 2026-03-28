import {createClient} from "@/lib/supabase/server";
import {bulkDeleteMealEntriesRepository} from "@/repositories/meals/bulk-delete-meal-entries";

export async function bulkDeleteMealEntries(ids: string[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("User not authenticated");
    }
    return await bulkDeleteMealEntriesRepository(ids);
}
