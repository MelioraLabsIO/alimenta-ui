import { apiFetch } from "@/apiClient/client";
import { getSession } from "@/lib/supabase/session";

import {
    FoodPreferencesUpdate,
    GeneralPreferencesUpdate,
    UserProfile,
} from "@/core/types/models/profile";
import { withProfilePreferences } from "@/lib/food-preferences";

interface UpdateProfileInput {
    firstName: string;
    lastName: string;
}

type SavedProfile = ReturnType<typeof toSavedProfile>;

function toSavedProfile(userProfile: UserProfile) {
    return {
        ...withProfilePreferences(userProfile),
        displayName: `${userProfile.firstName} ${userProfile.lastName}`,
    };
}

async function updateProfile(
    data: Partial<UpdateProfileInput>
): Promise<SavedProfile> {
    const session = await getSession();

    const userProfile = await apiFetch<UserProfile>("/api/v1/profile", {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
            Authorization: `Bearer ${session.access_token}`,
        },
    });

    return toSavedProfile(userProfile);
}

/**
 * Saves preferences with `PATCH /api/v1/profile`. Fields left out of `data`
 * keep their saved values; names and email are never touched.
 */
async function patchPreferences(
    data: FoodPreferencesUpdate | GeneralPreferencesUpdate
): Promise<SavedProfile> {
    const userProfile = await apiFetch<UserProfile>("/api/v1/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
    });

    return toSavedProfile(userProfile);
}

/** Saves the "Food preferences" tab (PD-129). */
async function updateFoodPreferences(
    data: FoodPreferencesUpdate
): Promise<SavedProfile> {
    return patchPreferences(data);
}

/** Saves units and goal from the "Goal & body" tab (PD-133). */
async function updateGeneralPreferences(
    data: GeneralPreferencesUpdate
): Promise<SavedProfile> {
    return patchPreferences(data);
}

export { updateFoodPreferences, updateGeneralPreferences, updateProfile };
