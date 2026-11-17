import { apiFetch } from "@/apiClient/client";
import { getSession } from "@/lib/supabase/session";

import {
    FoodPreferencesUpdate,
    UserProfile,
} from "@/core/types/models/profile";
import { withFoodPreferences } from "@/lib/food-preferences";

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
        ...withFoodPreferences(userProfile),
        displayName: `${userProfile.firstName} ${userProfile.lastName}`,
    };
}

/**
 * Saves food preferences with `PATCH /api/v1/profile`. Fields left out of
 * `data` keep their saved values; names and email are never touched.
 */
async function updateFoodPreferences(
    data: FoodPreferencesUpdate
): Promise<UserProfile & { displayName: string }> {
    const userProfile = await apiFetch<UserProfile>("/api/v1/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
    });

    return {
        ...withFoodPreferences(userProfile),
        displayName: `${userProfile.firstName} ${userProfile.lastName}`,
    };
}

export { updateFoodPreferences, updateProfile };
