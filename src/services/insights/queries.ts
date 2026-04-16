import {apiFetch} from "@/apiClient/client";
import {getSession} from "@/lib/supabase/session";

async function getTopFood(): Promise<{ title: string; foodCount: number }>{
    const session = await getSession();
    const response = await apiFetch("/api/v1/insights/top-food", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${session.access_token}`,
        },
    });
    if (!response) {
        throw new Error("Failed to fetch top food");
    }
    return response;
}

export {getTopFood};
