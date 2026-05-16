import {apiFetch} from "@/apiClient/client";

interface UpdateProfileInput {
    firstName: string;
    lastName: string;
}

async function updateProfile(data: Partial<UpdateProfileInput>) {
    return await apiFetch("/api/v1/profile", {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export {updateProfile};
