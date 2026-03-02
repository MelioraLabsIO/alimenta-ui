export const aiClient = {
    async analyzeText(text: string) {
        const baseUrl = process.env.ALIMENTA_AI_SERVICE_URL;
        const apiKey = process.env.ALIMENTA_AI_SERVICE_KEY;
        const response = await fetch(`${baseUrl}/analyze`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            const details = await response.text().catch(() => "");
            throw new Error(`AI service failed (${response.status}). ${details}`);
        }

        return response.json();
    },
};

export type AIResponse = {
    foods: string[];
    calories: number;
    sentiment: string;
};