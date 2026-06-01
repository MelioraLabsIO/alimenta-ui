import {apiFetch} from "@/apiClient/client";
import {getSession} from "@/lib/supabase/session";
import {UserProfileResponse} from "@/services/profile/queries";

interface UpdateProfileInput {
    firstName: string;
    lastName: string;
}

async function updateProfile(data: Partial<UpdateProfileInput>): Promise<UserProfileResponse> {
    const session = await getSession();

    return await apiFetch<UserProfileResponse>("/api/v1/profile", {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
            "Authorization": `Bearer ${session.access_token}`,
        },
    });
}

export {updateProfile};
