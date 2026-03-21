async function getUserProfile() {
    const response = await fetch("/api/v1/user-profile");

    if (!response.ok) {
        throw new Error("Failed to fetch user profile");
    }

    return response.json();
}

export { getUserProfile };