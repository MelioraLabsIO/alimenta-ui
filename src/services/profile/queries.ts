import {apiFetch} from "@/apiClient/client";
import {getSession} from "@/lib/supabase/session";

async function getUserProfile() {
    const session = await getSession();

    const response = await apiFetch("/api/v1/profile", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${session.access_token}`,
        },
    });

    if (!response) {
        throw new Error("Failed to fetch user profile");
    }

    return response;
}

export {getUserProfile};
