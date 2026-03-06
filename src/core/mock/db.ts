// src/core/mock/db.ts

import { Meal, MealType } from "@/core/types";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function iso(daysAgo: number, hour = 12): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

const seed: Meal[] = [
  {
    id: "m1",
    title: "Avocado Toast & Eggs",
    mealType: "breakfast",
    date: iso(0, 8),
    foods: [
      { id: "f1", name: "Sourdough bread", quantity: 2, unit: "slices" },
      { id: "f2", name: "Avocado", quantity: 1, unit: "whole" },
      { id: "f3", name: "Eggs", quantity: 2, unit: "large" },
    ],
    nutrition: { calories: 520, protein: 22, carbs: 48, fat: 28 },
    metrics: { mood: 4, energy: 4, digestion: 5, notes: "Felt great after this" },
    createdAt: iso(0, 8),
    updatedAt: iso(0, 8),
  },
  {
    id: "m2",
    title: "Grilled Chicken Salad",
    mealType: "lunch",
    date: iso(0, 13),
    foods: [
      { id: "f4", name: "Chicken breast", quantity: 180, unit: "g" },
      { id: "f5", name: "Mixed greens", quantity: 100, unit: "g" },
      { id: "f6", name: "Cherry tomatoes", quantity: 80, unit: "g" },
      { id: "f7", name: "Olive oil", quantity: 1, unit: "tbsp" },
    ],
    nutrition: { calories: 380, protein: 42, carbs: 12, fat: 16 },
    metrics: { mood: 5, energy: 5, digestion: 4 },
    createdAt: iso(0, 13),
    updatedAt: iso(0, 13),
  },
  {
    id: "m3",
    title: "Pasta Bolognese",
    mealType: "dinner",
    date: iso(1, 19),
    foods: [
      { id: "f8", name: "Spaghetti", quantity: 200, unit: "g" },
      { id: "f9", name: "Ground beef", quantity: 150, unit: "g" },
      { id: "f10", name: "Tomato sauce", quantity: 120, unit: "ml" },
      { id: "f11", name: "Parmesan", quantity: 30, unit: "g" },
    ],
    nutrition: { calories: 720, protein: 38, carbs: 82, fat: 22 },
    metrics: { mood: 3, energy: 3, digestion: 2, notes: "Felt a bit heavy" },
    createdAt: iso(1, 19),
    updatedAt: iso(1, 19),
  },
  {
    id: "m4",
    title: "Greek Yogurt & Berries",
    mealType: "snack",
    date: iso(1, 15),
    foods: [
      { id: "f12", name: "Greek yogurt", quantity: 200, unit: "g" },
      { id: "f13", name: "Blueberries", quantity: 80, unit: "g" },
      { id: "f14", name: "Honey", quantity: 1, unit: "tsp" },
    ],
    nutrition: { calories: 210, protein: 18, carbs: 28, fat: 3 },
    metrics: { mood: 4, energy: 4, digestion: 5 },
    createdAt: iso(1, 15),
    updatedAt: iso(1, 15),
  },
  {
    id: "m5",
    title: "Oatmeal with Banana",
    mealType: "breakfast",
    date: iso(2, 8),
    foods: [
      { id: "f15", name: "Rolled oats", quantity: 80, unit: "g" },
      { id: "f16", name: "Banana", quantity: 1, unit: "medium" },
      { id: "f17", name: "Almond milk", quantity: 200, unit: "ml" },
    ],
    nutrition: { calories: 340, protein: 10, carbs: 62, fat: 6 },
    metrics: { mood: 4, energy: 5, digestion: 5 },
    createdAt: iso(2, 8),
    updatedAt: iso(2, 8),
  },
  {
    id: "m6",
    title: "Salmon & Roasted Veggies",
    mealType: "dinner",
    date: iso(2, 19),
    foods: [
      { id: "f18", name: "Salmon fillet", quantity: 200, unit: "g" },
      { id: "f19", name: "Broccoli", quantity: 150, unit: "g" },
      { id: "f20", name: "Sweet potato", quantity: 120, unit: "g" },
    ],
    nutrition: { calories: 560, protein: 46, carbs: 38, fat: 22 },
    metrics: { mood: 5, energy: 5, digestion: 5, notes: "Best meal this week" },
    createdAt: iso(2, 19),
    updatedAt: iso(2, 19),
  },
  {
    id: "m7",
    title: "Protein Smoothie",
    mealType: "snack",
    date: iso(3, 10),
    foods: [
      { id: "f21", name: "Whey protein", quantity: 30, unit: "g" },
      { id: "f22", name: "Banana", quantity: 1, unit: "medium" },
      { id: "f23", name: "Peanut butter", quantity: 1, unit: "tbsp" },
      { id: "f24", name: "Oat milk", quantity: 250, unit: "ml" },
    ],
    nutrition: { calories: 420, protein: 32, carbs: 44, fat: 12 },
    metrics: { mood: 4, energy: 5, digestion: 4 },
    createdAt: iso(3, 10),
    updatedAt: iso(3, 10),
  },
  {
    id: "m8",
    title: "Veggie Stir Fry",
    mealType: "lunch",
    date: iso(3, 13),
    foods: [
      { id: "f25", name: "Tofu", quantity: 150, unit: "g" },
      { id: "f26", name: "Bell peppers", quantity: 100, unit: "g" },
      { id: "f27", name: "Brown rice", quantity: 150, unit: "g" },
      { id: "f28", name: "Soy sauce", quantity: 2, unit: "tbsp" },
    ],
    nutrition: { calories: 440, protein: 20, carbs: 58, fat: 12 },
    metrics: { mood: 4, energy: 4, digestion: 4 },
    createdAt: iso(3, 13),
    updatedAt: iso(3, 13),
  },
  {
    id: "m9",
    title: "Overnight Oats",
    mealType: "breakfast",
    date: iso(4, 8),
    foods: [
      { id: "f29", name: "Rolled oats", quantity: 70, unit: "g" },
      { id: "f30", name: "Chia seeds", quantity: 10, unit: "g" },
      { id: "f31", name: "Almond milk", quantity: 200, unit: "ml" },
      { id: "f32", name: "Strawberries", quantity: 80, unit: "g" },
    ],
    nutrition: { calories: 310, protein: 9, carbs: 52, fat: 8 },
    metrics: { mood: 4, energy: 4, digestion: 5 },
    createdAt: iso(4, 8),
    updatedAt: iso(4, 8),
  },
  {
    id: "m10",
    title: "Burger & Fries",
    mealType: "dinner",
    date: iso(5, 20),
    foods: [
      { id: "f33", name: "Beef burger", quantity: 1, unit: "whole" },
      { id: "f34", name: "Fries", quantity: 150, unit: "g" },
      { id: "f35", name: "Coke", quantity: 330, unit: "ml" },
    ],
    nutrition: { calories: 980, protein: 34, carbs: 98, fat: 48 },
    metrics: { mood: 3, energy: 2, digestion: 2, notes: "Cheat day, felt sluggish" },
    createdAt: iso(5, 20),
    updatedAt: iso(5, 20),
  },
  {
    id: "m11",
    title: "Tuna Wrap",
    mealType: "lunch",
    date: iso(5, 13),
    foods: [
      { id: "f36", name: "Whole wheat wrap", quantity: 1, unit: "large" },
      { id: "f37", name: "Canned tuna", quantity: 120, unit: "g" },
      { id: "f38", name: "Lettuce", quantity: 40, unit: "g" },
      { id: "f39", name: "Greek yogurt", quantity: 30, unit: "g" },
    ],
    nutrition: { calories: 360, protein: 36, carbs: 32, fat: 8 },
    metrics: { mood: 4, energy: 4, digestion: 4 },
    createdAt: iso(5, 13),
    updatedAt: iso(5, 13),
  },
  {
    id: "m12",
    title: "Scrambled Eggs & Toast",
    mealType: "breakfast",
    date: iso(6, 8),
    foods: [
      { id: "f40", name: "Eggs", quantity: 3, unit: "large" },
      { id: "f41", name: "Whole wheat toast", quantity: 2, unit: "slices" },
      { id: "f42", name: "Butter", quantity: 1, unit: "tsp" },
    ],
    nutrition: { calories: 420, protein: 26, carbs: 34, fat: 18 },
    metrics: { mood: 4, energy: 4, digestion: 4 },
    createdAt: iso(6, 8),
    updatedAt: iso(6, 8),
  },
];

// In-memory store
let store: Meal[] = [...seed];

export function listMeals(): Meal[] {
  return [...store].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getMeal(id: string): Meal | undefined {
  return store.find((m) => m.id === id);
}

export function createMeal(meal: Omit<Meal, "id" | "createdAt" | "updatedAt">): Meal {
  const now = new Date().toISOString();
  const newMeal: Meal = { ...meal, id: uid(), createdAt: now, updatedAt: now };
  store = [newMeal, ...store];
  return newMeal;
}

export function updateMeal(id: string, patch: Partial<Omit<Meal, "id" | "createdAt">>): Meal {
  const idx = store.findIndex((m) => m.id === id);
  if (idx === -1) throw new Error(`Meal ${id} not found`);
  const updated: Meal = { ...store[idx], ...patch, updatedAt: new Date().toISOString() };
  store = store.map((m) => (m.id === id ? updated : m));
  return updated;
}

export function deleteMeal(id: string): void {
  store = store.filter((m) => m.id !== id);
}

export function duplicateMeal(id: string): Meal {
  const original = getMeal(id);
  if (!original) throw new Error(`Meal ${id} not found`);
  const now = new Date().toISOString();
  const copy: Meal = {
    ...original,
    id: uid(),
    title: `${original.title} (copy)`,
    date: now,
    createdAt: now,
    updatedAt: now,
  };
  store = [copy, ...store];
  return copy;
}

// Helpers for analytics
export function getMealsByDateRange(from: Date, to: Date): Meal[] {
  return store.filter((m) => {
    const d = new Date(m.date);
    return d >= from && d <= to;
  });
}

export type DailyCalories = { date: string; calories: number };

export function getWeeklyCalories(): DailyCalories[] {
  const days: DailyCalories[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-US", { weekday: "short" });
    const dayMeals = store.filter((m) => {
      const md = new Date(m.date);
      return (
        md.getFullYear() === d.getFullYear() &&
        md.getMonth() === d.getMonth() &&
        md.getDate() === d.getDate()
      );
    });
    const calories = dayMeals.reduce((sum, m) => sum + (m.nutrition?.calories ?? 0), 0);
    days.push({ date: label, calories });
  }
  return days;
}

export type MacroTotals = { name: string; value: number };

export function getWeeklyMacros(): MacroTotals[] {
  const from = new Date();
  from.setDate(from.getDate() - 6);
  from.setHours(0, 0, 0, 0);
  const meals = getMealsByDateRange(from, new Date());
  const totals = meals.reduce(
    (acc, m) => ({
      protein: acc.protein + (m.nutrition?.protein ?? 0),
      carbs: acc.carbs + (m.nutrition?.carbs ?? 0),
      fat: acc.fat + (m.nutrition?.fat ?? 0),
    }),
    { protein: 0, carbs: 0, fat: 0 }
  );
  return [
    { name: "Protein", value: totals.protein },
    { name: "Carbs", value: totals.carbs },
    { name: "Fat", value: totals.fat },
  ];
}

export type MoodEnergyPoint = { meal: string; mood: number; energy: number; calories: number };

export function getMoodEnergyData(): MoodEnergyPoint[] {
  return store
    .filter((m) => m.metrics)
    .map((m) => ({
      meal: m.title,
      mood: m.metrics!.mood,
      energy: m.metrics!.energy,
      calories: m.nutrition?.calories ?? 0,
    }));
}

export type FoodFrequency = { food: string; count: number };

export function getTopFoods(limit = 8): FoodFrequency[] {
  const freq: Record<string, number> = {};
  store.forEach((m) => {
    m.foods.forEach((f) => {
      freq[f.name] = (freq[f.name] ?? 0) + 1;
    });
  });
  return Object.entries(freq)
    .map(([food, count]) => ({ food, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export type DigestCorrelation = { food: string; avgDigestion: number };

export function getFoodsCorrelatedWithDigestion(limit = 6): DigestCorrelation[] {
  const map: Record<string, number[]> = {};
  store.forEach((m) => {
    if (!m.metrics) return;
    m.foods.forEach((f) => {
      if (!map[f.name]) map[f.name] = [];
      map[f.name].push(m.metrics!.digestion);
    });
  });
  return Object.entries(map)
    .filter(([, scores]) => scores.length >= 1)
    .map(([food, scores]) => ({
      food,
      avgDigestion: scores.reduce((a, b) => a + b, 0) / scores.length,
    }))
    .sort((a, b) => b.avgDigestion - a.avgDigestion)
    .slice(0, limit);
}

export type MoodTrend = { date: string; mood: number; energy: number };

export function getMoodTrend(): MoodTrend[] {
  const days: MoodTrend[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-US", { weekday: "short" });
    const dayMeals = store.filter((m) => {
      const md = new Date(m.date);
      return (
        md.getFullYear() === d.getFullYear() &&
        md.getMonth() === d.getMonth() &&
        md.getDate() === d.getDate() &&
        m.metrics
      );
    });
    if (dayMeals.length === 0) {
      days.push({ date: label, mood: 0, energy: 0 });
    } else {
      const avgMood =
        dayMeals.reduce((s, m) => s + (m.metrics?.mood ?? 0), 0) / dayMeals.length;
      const avgEnergy =
        dayMeals.reduce((s, m) => s + (m.metrics?.energy ?? 0), 0) / dayMeals.length;
      days.push({ date: label, mood: +avgMood.toFixed(1), energy: +avgEnergy.toFixed(1) });
    }
  }
  return days;
}
