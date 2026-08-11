import { apiFetch } from "@/apiClient/client";
import { UserProfile } from "@/core/types/models/profile";

async function getUserProfile(): Promise<
    UserProfile & { displayName: string }
> {
    const userProfile = await apiFetch<UserProfile>("/api/v1/profile", {
        method: "GET",
    });

    // TODO: Analyze if the below error is fully necessary and
    //  handle errors and return a more descriptive error message
    if (!userProfile) {
        throw new Error("Failed to fetch user profile");
    }

    return {
        ...userProfile,
        displayName: `${userProfile.firstName} ${userProfile.lastName}`,
    };
}

export { getUserProfile };
