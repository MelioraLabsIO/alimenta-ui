// src/core/types.ts

export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "other";

export type FoodItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
};

export type MoodMetrics = {
  mood: number; // 1–5
  energy: number; // 1–5
  digestion: number; // 1–5
  notes?: string;
};

export type NutritionSummary = {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
};

export type Meal = {
  id: string;
  title: string;
  mealType: MealType;
  date: string; // ISO string
  foods: FoodItem[];
  nutrition?: NutritionSummary;
  metrics?: MoodMetrics;
  createdAt: string;
  updatedAt: string;
};

export type ParsedMeal = {
  title: string;
  foods: FoodItem[];
  nutrition: NutritionSummary;
  confidence: number; // 0–1
  rawText: string;
};
