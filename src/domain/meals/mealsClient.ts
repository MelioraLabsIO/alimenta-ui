export const mealsClient = {
    async getAllMeals() {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
            ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

        const response = await fetch(`${baseUrl}/api/v1/meals`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        // const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/v1/meals`, );

        if (!response.ok) {
            const details = await response.text().catch(() => "");
            throw new Error(`Something failed (${response.status}). ${details}`);
        }

        return response.json();
    },
};

