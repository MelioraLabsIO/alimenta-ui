import { createClient } from "@/lib/supabase/client";
import { Session } from "@supabase/supabase-js";

export async function getSession(): Promise<Session> {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
        throw new Error("No active session found");
    }

    return session;
}
