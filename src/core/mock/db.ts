// src/core/mock/db.ts

import {EMealType, Meal} from "@/core/types";

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
        type: EMealType.BREAKFAST,
        foodTime: iso(0, 8),
        items: [
            {id: "mi1", mealId: "m1", catalogFoodId: "f1", quantity: 2, unit: "slices", catalogFood: {id: "f1", name: "Sourdough bread", calories: 100, protein: 4, carbs: 18, fat: 2}},
            {id: "mi2", mealId: "m1", catalogFoodId: "f2", quantity: 1, unit: "whole", catalogFood: {id: "f2", name: "Avocado", calories: 160, protein: 2, carbs: 9, fat: 15}},
            {id: "mi3", mealId: "m1", catalogFoodId: "f3", quantity: 2, unit: "large", catalogFood: {id: "f3", name: "Eggs", calories: 78, protein: 6, carbs: 0.5, fat: 6}},
        ],
        nutrition: {calories: 520, protein: 22, carbs: 48, fat: 28},
        mood: 4,
        energy: 4,
        digestion: 5,
        notes: "Felt great after this",
        createdAt: iso(0, 8),
        updatedAt: iso(0, 8),
    },
    {
        id: "m2",
        title: "Grilled Chicken Salad",
        type: EMealType.LUNCH,
        foodTime: iso(0, 13),
        items: [
            {id: "mi4", mealId: "m2", catalogFoodId: "f4", quantity: 180, unit: "g", catalogFood: {id: "f4", name: "Chicken breast", calories: 165, protein: 31, carbs: 0, fat: 3.6}},
            {id: "mi5", mealId: "m2", catalogFoodId: "f5", quantity: 100, unit: "g", catalogFood: {id: "f5", name: "Mixed greens", calories: 15, protein: 2, carbs: 2.4, fat: 0.4}},
            {id: "mi6", mealId: "m2", catalogFoodId: "f6", quantity: 80, unit: "g", catalogFood: {id: "f6", name: "Cherry tomatoes", calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2}},
            {id: "mi7", mealId: "m2", catalogFoodId: "f7", quantity: 1, unit: "tbsp", catalogFood: {id: "f7", name: "Olive oil", calories: 120, protein: 0, carbs: 0, fat: 14}},
        ],
        nutrition: {calories: 380, protein: 42, carbs: 12, fat: 16},
        mood: 5,
        energy: 5,
        digestion: 4,
        createdAt: iso(0, 13),
        updatedAt: iso(0, 13),
    },
    {
        id: "m3",
        title: "Pasta Bolognese",
        type: EMealType.DINNER,
        foodTime: iso(1, 19),
        items: [
            {id: "mi8", mealId: "m3", catalogFoodId: "f8", quantity: 200, unit: "g", catalogFood: {id: "f8", name: "Spaghetti", calories: 220, protein: 8, carbs: 43, fat: 1.1}},
            {id: "mi9", mealId: "m3", catalogFoodId: "f9", quantity: 150, unit: "g", catalogFood: {id: "f9", name: "Ground beef", calories: 217, protein: 23, carbs: 0, fat: 13}},
            {id: "mi10", mealId: "m3", catalogFoodId: "f10", quantity: 120, unit: "ml", catalogFood: {id: "f10", name: "Tomato sauce", calories: 30, protein: 1.5, carbs: 6, fat: 0.3}},
            {id: "mi11", mealId: "m3", catalogFoodId: "f11", quantity: 30, unit: "g", catalogFood: {id: "f11", name: "Parmesan", calories: 110, protein: 10, carbs: 1, fat: 7}},
        ],
        nutrition: {calories: 720, protein: 38, carbs: 82, fat: 22},
        mood: 3,
        energy: 3,
        digestion: 2,
        notes: "Felt a bit heavy",
        createdAt: iso(1, 19),
        updatedAt: iso(1, 19),
    },
    {
        id: "m4",
        title: "Greek Yogurt & Berries",
        type: EMealType.SNACK,
        foodTime: iso(1, 15),
        items: [
            {id: "mi12", mealId: "m4", catalogFoodId: "f12", quantity: 200, unit: "g", catalogFood: {id: "f12", name: "Greek yogurt", calories: 100, protein: 17, carbs: 3.25, fat: 0.4}},
            {id: "mi13", mealId: "m4", catalogFoodId: "f13", quantity: 80, unit: "g", catalogFood: {id: "f13", name: "Blueberries", calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3}},
            {id: "mi14", mealId: "m4", catalogFoodId: "f14", quantity: 1, unit: "tsp", catalogFood: {id: "f14", name: "Honey", calories: 64, protein: 0.06, carbs: 17.3, fat: 0}},
        ],
        nutrition: {calories: 210, protein: 18, carbs: 28, fat: 3},
        mood: 4,
        energy: 4,
        digestion: 5,
        createdAt: iso(1, 15),
        updatedAt: iso(1, 15),
    },
    {
        id: "m5",
        title: "Oatmeal with Banana",
        type: EMealType.BREAKFAST,
        foodTime: iso(2, 8),
        items: [
            {id: "mi15", mealId: "m5", catalogFoodId: "f15", quantity: 80, unit: "g", catalogFood: {id: "f15", name: "Rolled oats", calories: 300, protein: 10, carbs: 54, fat: 5}},
            {id: "mi16", mealId: "m5", catalogFoodId: "f16", quantity: 1, unit: "medium", catalogFood: {id: "f16", name: "Banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.3}},
            {id: "mi17", mealId: "m5", catalogFoodId: "f17", quantity: 200, unit: "ml", catalogFood: {id: "f17", name: "Almond milk", calories: 60, protein: 1.5, carbs: 2, fat: 2.5}},
        ],
        nutrition: {calories: 340, protein: 10, carbs: 62, fat: 6},
        mood: 4,
        energy: 5,
        digestion: 5,
        createdAt: iso(2, 8),
        updatedAt: iso(2, 8),
    },
    {
        id: "m6",
        title: "Salmon & Roasted Veggies",
        type: EMealType.DINNER,
        foodTime: iso(2, 19),
        items: [
            {id: "mi18", mealId: "m6", catalogFoodId: "f18", quantity: 200, unit: "g", catalogFood: {id: "f18", name: "Salmon fillet", calories: 280, protein: 25, carbs: 0, fat: 20}},
            {id: "mi19", mealId: "m6", catalogFoodId: "f19", quantity: 150, unit: "g", catalogFood: {id: "f19", name: "Broccoli", calories: 45, protein: 3, carbs: 9, fat: 0.4}},
            {id: "mi20", mealId: "m6", catalogFoodId: "f20", quantity: 120, unit: "g", catalogFood: {id: "f20", name: "Sweet potato", calories: 103, protein: 1.6, carbs: 24, fat: 0.1}},
        ],
        nutrition: {calories: 560, protein: 46, carbs: 38, fat: 22},
        mood: 5,
        energy: 5,
        digestion: 5,
        notes: "Best meal this week",
        createdAt: iso(2, 19),
        updatedAt: iso(2, 19),
    },
    {
        id: "m7",
        title: "Protein Smoothie",
        type: EMealType.SNACK,
        foodTime: iso(3, 10),
        items: [
            {id: "mi21", mealId: "m7", catalogFoodId: "f21", quantity: 30, unit: "g", catalogFood: {id: "f21", name: "Whey protein", calories: 120, protein: 25, carbs: 2, fat: 1}},
            {id: "mi22", mealId: "m7", catalogFoodId: "f22", quantity: 1, unit: "medium", catalogFood: {id: "f22", name: "Banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.3}},
            {id: "mi23", mealId: "m7", catalogFoodId: "f23", quantity: 1, unit: "tbsp", catalogFood: {id: "f23", name: "Peanut butter", calories: 94, protein: 4, carbs: 3.5, fat: 8}},
            {id: "mi24", mealId: "m7", catalogFoodId: "f24", quantity: 250, unit: "ml", catalogFood: {id: "f24", name: "Oat milk", calories: 98, protein: 2.5, carbs: 10, fat: 5}},
        ],
        nutrition: {calories: 420, protein: 32, carbs: 44, fat: 12},
        mood: 4,
        energy: 5,
        digestion: 4,
        createdAt: iso(3, 10),
        updatedAt: iso(3, 10),
    },
    {
        id: "m8",
        title: "Veggie Stir Fry",
        type: EMealType.LUNCH,
        foodTime: iso(3, 13),
        items: [
            {id: "mi25", mealId: "m8", catalogFoodId: "f25", quantity: 150, unit: "g", catalogFood: {id: "f25", name: "Tofu", calories: 76, protein: 9, carbs: 1.6, fat: 4.8}},
            {id: "mi26", mealId: "m8", catalogFoodId: "f26", quantity: 100, unit: "g", catalogFood: {id: "f26", name: "Bell peppers", calories: 31, protein: 1, carbs: 6, fat: 0.3}},
            {id: "mi27", mealId: "m8", catalogFoodId: "f27", quantity: 150, unit: "g", catalogFood: {id: "f27", name: "Brown rice", calories: 195, protein: 4.5, carbs: 43, fat: 1.5}},
            {id: "mi28", mealId: "m8", catalogFoodId: "f28", quantity: 2, unit: "tbsp", catalogFood: {id: "f28", name: "Soy sauce", calories: 30, protein: 5, carbs: 1, fat: 0}},
        ],
        nutrition: {calories: 440, protein: 20, carbs: 58, fat: 12},
        mood: 4,
        energy: 4,
        digestion: 4,
        createdAt: iso(3, 13),
        updatedAt: iso(3, 13),
    },
    {
        id: "m9",
        title: "Overnight Oats",
        type: EMealType.BREAKFAST,
        foodTime: iso(4, 8),
        items: [
            {id: "mi29", mealId: "m9", catalogFoodId: "f29", quantity: 70, unit: "g", catalogFood: {id: "f29", name: "Rolled oats", calories: 262, protein: 8.8, carbs: 48, fat: 4.4}},
            {id: "mi30", mealId: "m9", catalogFoodId: "f30", quantity: 10, unit: "g", catalogFood: {id: "f30", name: "Chia seeds", calories: 49, protein: 2, carbs: 4, fat: 3}},
            {id: "mi31", mealId: "m9", catalogFoodId: "f31", quantity: 200, unit: "ml", catalogFood: {id: "f31", name: "Almond milk", calories: 60, protein: 1.5, carbs: 2, fat: 2.5}},
            {id: "mi32", mealId: "m9", catalogFoodId: "f32", quantity: 80, unit: "g", catalogFood: {id: "f32", name: "Strawberries", calories: 32, protein: 0.8, carbs: 7.7, fat: 0.3}},
        ],
        nutrition: {calories: 310, protein: 9, carbs: 52, fat: 8},
        mood: 4,
        energy: 4,
        digestion: 5,
        createdAt: iso(4, 8),
        updatedAt: iso(4, 8),
    },
    {
        id: "m10",
        title: "Burger & Fries",
        type: EMealType.DINNER,
        foodTime: iso(5, 20),
        items: [
            {id: "mi33", mealId: "m10", catalogFoodId: "f33", quantity: 1, unit: "whole", catalogFood: {id: "f33", name: "Beef burger", calories: 540, protein: 28, carbs: 41, fat: 28}},
            {id: "mi34", mealId: "m10", catalogFoodId: "f34", quantity: 150, unit: "g", catalogFood: {id: "f34", name: "Fries", calories: 356, protein: 4, carbs: 48, fat: 17}},
            {id: "mi35", mealId: "m10", catalogFoodId: "f35", quantity: 330, unit: "ml", catalogFood: {id: "f35", name: "Coke", calories: 140, protein: 0, carbs: 39, fat: 0}},
        ],
        nutrition: {calories: 980, protein: 34, carbs: 98, fat: 48},
        mood: 3,
        energy: 2,
        digestion: 2,
        notes: "Cheat day, felt sluggish",
        createdAt: iso(5, 20),
        updatedAt: iso(5, 20),
    },
    {
        id: "m11",
        title: "Tuna Wrap",
        type: EMealType.LUNCH,
        foodTime: iso(5, 13),
        items: [
            {id: "mi36", mealId: "m11", catalogFoodId: "f36", quantity: 1, unit: "large", catalogFood: {id: "f36", name: "Whole wheat wrap", calories: 170, protein: 6, carbs: 30, fat: 3}},
            {id: "mi37", mealId: "m11", catalogFoodId: "f37", quantity: 120, unit: "g", catalogFood: {id: "f37", name: "Canned tuna", calories: 132, protein: 25, carbs: 0, fat: 1.3}},
            {id: "mi38", mealId: "m11", catalogFoodId: "f38", quantity: 40, unit: "g", catalogFood: {id: "f38", name: "Lettuce", calories: 5, protein: 0.4, carbs: 1, fat: 0.1}},
            {id: "mi39", mealId: "m11", catalogFoodId: "f39", quantity: 30, unit: "g", catalogFood: {id: "f39", name: "Greek yogurt", calories: 30, protein: 5, carbs: 0.975, fat: 0.12}},
        ],
        nutrition: {calories: 360, protein: 36, carbs: 32, fat: 8},
        mood: 4,
        energy: 4,
        digestion: 4,
        createdAt: iso(5, 13),
        updatedAt: iso(5, 13),
    },
    {
        id: "m12",
        title: "Scrambled Eggs & Toast",
        type: EMealType.BREAKFAST,
        foodTime: iso(6, 8),
        items: [
            {id: "mi40", mealId: "m12", catalogFoodId: "f40", quantity: 3, unit: "large", catalogFood: {id: "f40", name: "Eggs", calories: 234, protein: 18, carbs: 1.5, fat: 18}},
            {id: "mi41", mealId: "m12", catalogFoodId: "f41", quantity: 2, unit: "slices", catalogFood: {id: "f41", name: "Whole wheat toast", calories: 160, protein: 8, carbs: 28, fat: 2}},
            {id: "mi42", mealId: "m12", catalogFoodId: "f42", quantity: 1, unit: "tsp", catalogFood: {id: "f42", name: "Butter", calories: 36, protein: 0, carbs: 0, fat: 4}},
        ],
        nutrition: {calories: 420, protein: 26, carbs: 34, fat: 18},
        mood: 4,
        energy: 4,
        digestion: 4,
        createdAt: iso(6, 8),
        updatedAt: iso(6, 8),
    },
];

// In-memory store
let store: Meal[] = [...seed];

export function listMeals(): Meal[] {
    return [...store].sort(
        (a, b) => new Date(b.foodTime!).getTime() - new Date(a.foodTime!).getTime()
    );
}

export function getMeal(id: string): Meal | undefined {
    return store.find((m) => m.id === id);
}

export function createMeal(meal: Omit<Meal, "id" | "createdAt" | "updatedAt">): Meal {
    const now = new Date().toISOString();
    const newMeal: Meal = {...meal, id: uid(), createdAt: now, updatedAt: now};
    store = [newMeal, ...store];
    return newMeal;
}

export function updateMeal(id: string, patch: Partial<Omit<Meal, "id" | "createdAt">>): Meal {
    const idx = store.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error(`Meal ${id} not found`);
    const updated: Meal = {...store[idx], ...patch, updatedAt: new Date().toISOString()};
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
        foodTime: now,
        createdAt: now,
        updatedAt: now,
    };
    store = [copy, ...store];
    return copy;
}

// Helpers for analytics
export function getMealsByDateRange(from: Date, to: Date): Meal[] {
    return store.filter((m) => {
        const d = new Date(m.foodTime || new Date());
        return d >= from && d <= to;
    });
}

export type DailyCalories = { date: string; calories: number };

export function getWeeklyCalories(): DailyCalories[] {
    const days: DailyCalories[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString("en-US", {weekday: "short"});
        const dayMeals = store.filter((m) => {
            const md = new Date(m.foodTime || new Date());
            return (
                md.getFullYear() === d.getFullYear() &&
                md.getMonth() === d.getMonth() &&
                md.getDate() === d.getDate()
            );
        });
        const calories = dayMeals.reduce((sum, m) => sum + (m.nutrition?.calories ?? 0), 0);
        days.push({date: label, calories});
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
        {protein: 0, carbs: 0, fat: 0}
    );
    return [
        {name: "Protein", value: totals.protein},
        {name: "Carbs", value: totals.carbs},
        {name: "Fat", value: totals.fat},
    ];
}

export type MoodEnergyPoint = { meal: string; mood: number; energy: number; calories: number };

export function getMoodEnergyData(): MoodEnergyPoint[] {
    return store
        .filter((m) => m.mood !== undefined && m.energy !== undefined)
        .map((m) => ({
            meal: m.title,
            mood: m.mood ?? 0,
            energy: m.energy ?? 0,
            calories: m.nutrition?.calories ?? 0,
        }));
}

export type FoodFrequency = { food: string; count: number };

export function getTopFoods(limit = 8): FoodFrequency[] {
    const freq: Record<string, number> = {};
    store.forEach((m) => {
        (m.items || []).forEach((item) => {
            const foodName = item.catalogFood.name;
            freq[foodName] = (freq[foodName] ?? 0) + 1;
        });
    });
    return Object.entries(freq)
        .map(([food, count]) => ({food, count}))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

export type DigestCorrelation = { food: string; avgDigestion: number };

export function getFoodsCorrelatedWithDigestion(limit = 6): DigestCorrelation[] {
    const map: Record<string, number[]> = {};
    store.forEach((m) => {
        if (m.digestion === undefined) return;
        (m.items || []).forEach((item) => {
            const foodName = item.catalogFood.name;
            if (!map[foodName]) map[foodName] = [];
            map[foodName].push(m.digestion!);
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
        const label = d.toLocaleDateString("en-US", {weekday: "short"});
        const dayMeals = store.filter((m) => {
            const md = new Date(m.foodTime || new Date());
            return (
                md.getFullYear() === d.getFullYear() &&
                md.getMonth() === d.getMonth() &&
                md.getDate() === d.getDate() &&
                m.mood !== undefined &&
                m.energy !== undefined
            );
        });
        if (dayMeals.length === 0) {
            days.push({date: label, mood: 0, energy: 0});
        } else {
            const avgMood =
                dayMeals.reduce((s, m) => s + (m.mood ?? 0), 0) / dayMeals.length;
            const avgEnergy =
                dayMeals.reduce((s, m) => s + (m.energy ?? 0), 0) / dayMeals.length;
            days.push({date: label, mood: +avgMood.toFixed(1), energy: +avgEnergy.toFixed(1)});
        }
    }
    return days;
}
