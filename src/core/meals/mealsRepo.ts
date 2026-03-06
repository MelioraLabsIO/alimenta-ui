// src/core/meals/mealsRepo.ts
// Repository abstraction — swap mock DB for real API/Supabase here later.

import * as db from "@/core/mock/db";
import { Meal } from "@/core/types";

export const mealsRepo = {
  list: (): Meal[] => db.listMeals(),
  get: (id: string): Meal | undefined => db.getMeal(id),
  create: (meal: Omit<Meal, "id" | "createdAt" | "updatedAt">): Meal => db.createMeal(meal),
  update: (id: string, patch: Partial<Omit<Meal, "id" | "createdAt">>): Meal =>
    db.updateMeal(id, patch),
  delete: (id: string): void => db.deleteMeal(id),
  duplicate: (id: string): Meal => db.duplicateMeal(id),

  // Analytics
  weeklyCalories: () => db.getWeeklyCalories(),
  weeklyMacros: () => db.getWeeklyMacros(),
  moodEnergyData: () => db.getMoodEnergyData(),
  topFoods: (limit?: number) => db.getTopFoods(limit),
  digestCorrelation: (limit?: number) => db.getFoodsCorrelatedWithDigestion(limit),
  moodTrend: () => db.getMoodTrend(),
};
