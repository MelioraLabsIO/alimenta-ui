import { apiFetch } from "@/apiClient/client";
import { getSession } from "@/lib/supabase/session";

import { UserProfile } from "@/core/types/models/profile";

interface UpdateProfileInput {
    firstName: string;
    lastName: string;
}

async function updateProfile(
    data: Partial<UpdateProfileInput>
): Promise<UserProfile & { displayName: string }> {
    const session = await getSession();

    const userProfile = await apiFetch<UserProfile>("/api/v1/profile", {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
            Authorization: `Bearer ${session.access_token}`,
        },
    });

    return {
        ...userProfile,
        displayName: `${userProfile.firstName} ${userProfile.lastName}`,
    };
}

export { updateProfile };
