async function getAllMeals() {
    const response = await fetch("/api/v1/meals");

    if (!response.ok) {
        throw new Error("Failed to fetch all meals");
    }

    return response.json();
}

async function getThisWeekMeals() {
    const response = await fetch("/api/v1/meals?range=this-week");

    if (!response.ok) {
        throw new Error("Failed to fetch this week's meals");
    }

    return response.json();
}

export { getAllMeals, getThisWeekMeals };
