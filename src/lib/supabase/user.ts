import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export async function getCurrentUser(): Promise<User | null> {
    const supabase = createClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error) {
        throw new Error("No active session found");
    }

    return user;
}
