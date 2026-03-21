interface UpdateProfileInput {
    firstName: string;
    lastName: string;
}
async function updateProfile( data: Partial<UpdateProfileInput>) {
    const response = await fetch("/api/v1/user-profile", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error("Failed to update user profile");
    }
    const result = await response.json()
    return result?.data;
}

export { updateProfile };