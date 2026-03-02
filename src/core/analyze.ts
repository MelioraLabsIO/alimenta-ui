// src/core/analyze.ts

import {aiClient} from "@/services/ai/aiClient";

export type AnalyzeInput = {
    text: string;
    userId: string;
};

export type AnalyzeResult = {
    foods: string[];
    caloriesEstimate?: number;
    sentiment?: string;
};

export async function analyzeMeal(input: AnalyzeInput): Promise<AnalyzeResult> {
    if (!input.text || input.text.length < 5) {
        throw new Error("Meal description too short.");
    }

    // Call external AI service (Python service on Railway)
    const aiResponse = await aiClient.analyzeText(input.text);
    console.log("aiResponse: ", aiResponse)

    // You can enrich or transform the response here
    return {
        foods: aiResponse.foods,
        caloriesEstimate: aiResponse.calories,
        sentiment: aiResponse.sentiment,
    };
}