// src/core/analyze/analyzeMeal.ts
// AI boundary — mock now, shaped for future external service swap.

import { ParsedMeal, FoodItem } from "@/core/types";

export type AnalyzeInput = {
  text: string;
};

type MockPattern = {
  keywords: string[];
  foods: Omit<FoodItem, "id">[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

const patterns: MockPattern[] = [
  {
    keywords: ["oatmeal", "oats", "porridge"],
    foods: [
      { name: "Rolled oats", quantity: 80, unit: "g" },
      { name: "Almond milk", quantity: 200, unit: "ml" },
    ],
    calories: 320, protein: 10, carbs: 56, fat: 6,
  },
  {
    keywords: ["chicken", "salad"],
    foods: [
      { name: "Chicken breast", quantity: 180, unit: "g" },
      { name: "Mixed greens", quantity: 100, unit: "g" },
      { name: "Olive oil", quantity: 1, unit: "tbsp" },
    ],
    calories: 380, protein: 42, carbs: 10, fat: 14,
  },
  {
    keywords: ["pasta", "spaghetti", "bolognese"],
    foods: [
      { name: "Spaghetti", quantity: 200, unit: "g" },
      { name: "Ground beef", quantity: 150, unit: "g" },
      { name: "Tomato sauce", quantity: 120, unit: "ml" },
    ],
    calories: 680, protein: 36, carbs: 78, fat: 20,
  },
  {
    keywords: ["salmon", "fish"],
    foods: [
      { name: "Salmon fillet", quantity: 200, unit: "g" },
      { name: "Broccoli", quantity: 150, unit: "g" },
    ],
    calories: 480, protein: 44, carbs: 12, fat: 22,
  },
  {
    keywords: ["smoothie", "shake", "protein"],
    foods: [
      { name: "Whey protein", quantity: 30, unit: "g" },
      { name: "Banana", quantity: 1, unit: "medium" },
      { name: "Oat milk", quantity: 250, unit: "ml" },
    ],
    calories: 380, protein: 30, carbs: 42, fat: 8,
  },
  {
    keywords: ["eggs", "toast", "breakfast"],
    foods: [
      { name: "Eggs", quantity: 2, unit: "large" },
      { name: "Whole wheat toast", quantity: 2, unit: "slices" },
    ],
    calories: 360, protein: 22, carbs: 32, fat: 14,
  },
  {
    keywords: ["burger", "fries"],
    foods: [
      { name: "Beef burger", quantity: 1, unit: "whole" },
      { name: "Fries", quantity: 150, unit: "g" },
    ],
    calories: 860, protein: 32, carbs: 88, fat: 42,
  },
  {
    keywords: ["yogurt", "berries"],
    foods: [
      { name: "Greek yogurt", quantity: 200, unit: "g" },
      { name: "Mixed berries", quantity: 80, unit: "g" },
    ],
    calories: 200, protein: 18, carbs: 24, fat: 3,
  },
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export async function analyzeMeal(input: AnalyzeInput): Promise<ParsedMeal> {
  if (!input.text || input.text.trim().length < 5) {
    throw new Error("Meal description too short.");
  }

  // Simulate async latency
  await new Promise((r) => setTimeout(r, 600));

  const lower = input.text.toLowerCase();

  // Find best matching pattern
  let bestMatch: MockPattern | null = null;
  let bestScore = 0;

  for (const pattern of patterns) {
    const score = pattern.keywords.filter((kw) => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = pattern;
    }
  }

  // Fallback: generic parse from text words
  if (!bestMatch || bestScore === 0) {
    const words = input.text
      .split(/[\s,]+/)
      .filter((w) => w.length > 3)
      .slice(0, 4);
    return {
      title: words.slice(0, 3).join(" "),
      foods: words.map((w) => ({
        id: uid(),
        name: w.charAt(0).toUpperCase() + w.slice(1),
        quantity: 1,
        unit: "serving",
      })),
      nutrition: { calories: 350, protein: 15, carbs: 40, fat: 12 },
      confidence: 0.35,
      rawText: input.text,
    };
  }

  // Derive title from text (first 5 words, title-cased)
  const titleWords = input.text
    .split(/\s+/)
    .slice(0, 5)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  return {
    title: titleWords,
    foods: bestMatch.foods.map((f) => ({ ...f, id: uid() })),
    nutrition: {
      calories: bestMatch.calories,
      protein: bestMatch.protein,
      carbs: bestMatch.carbs,
      fat: bestMatch.fat,
    },
    confidence: 0.6 + bestScore * 0.1,
    rawText: input.text,
  };
}
