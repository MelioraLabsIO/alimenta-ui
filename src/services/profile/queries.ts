import {apiFetch} from "@/apiClient/client";
import {createClient} from "@/lib/supabase/client";


async function getUserProfile() {
    const {data: {session}} = await createClient().auth.getSession();

    const response = await apiFetch("/api/v1/profile", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${session?.access_token}`,
        },

    });

    if (!response) {
        throw new Error("Failed to fetch user profile");
    }

    return response
}

export {getUserProfile};