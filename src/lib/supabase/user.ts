import { createClient } from "@/lib/supabase/client";
import { createClient as createServerClient } from "@/lib/supabase/server";
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

/**
 * Server-side counterpart of `getCurrentUser`, for use in Server Components,
 * Route Handlers, and Server Actions where the request cookies (not the
 * browser session) are the source of truth.
 */
export async function getCurrentUserServer(): Promise<User | null> {
    const supabase = await createServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    return user;
}
