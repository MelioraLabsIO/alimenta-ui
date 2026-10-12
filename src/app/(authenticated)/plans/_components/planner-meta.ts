import { Apple, Moon, Sun, Sunrise, type LucideIcon } from "lucide-react";
import { EMealType } from "@/core/types/models/meal";
import type { PlannedMeal, PlannerSlot } from "@/core/types/models/planner";

/** Daily calorie target until it comes from the user's goal settings. */
export const DAILY_KCAL_TARGET = 2250;

export const SLOT_META: Record<
    PlannerSlot,
    { label: string; color: string; icon: LucideIcon; time: string }
> = {
    [EMealType.BREAKFAST]: {
        label: "Breakfast",
        color: "var(--am)",
        icon: Sunrise,
        time: "08:00",
    },
    [EMealType.LUNCH]: {
        label: "Lunch",
        color: "var(--ac)",
        icon: Sun,
        time: "13:00",
    },
    [EMealType.SNACK]: {
        label: "Snack",
        color: "var(--ro)",
        icon: Apple,
        time: "16:30",
    },
    [EMealType.DINNER]: {
        label: "Dinner",
        color: "var(--bl)",
        icon: Moon,
        time: "20:00",
    },
};

export const tint = (color: string, pct: number) =>
    `color-mix(in srgb, ${color} ${pct}%, transparent)`;

export const formatKcal = (n: number) => n.toLocaleString("en-US");

export type MealVisualState = "eaten" | "planned" | "missed";

export function mealState(meal: PlannedMeal, past: boolean): MealVisualState {
    if (meal.status === "eaten") return "eaten";
    return past ? "missed" : "planned";
}

export const STATE_LABEL: Record<MealVisualState, string> = {
    eaten: "Eaten",
    planned: "Planned",
    missed: "Missed",
};

/**
 * Card surface per state: eaten is a solid tint of the slot colour, planned
 * a dashed outline, missed a faded neutral dash.
 */
export function mealSurface(state: MealVisualState, color: string) {
    return {
        bg: state === "eaten" ? tint(color, 14) : "transparent",
        border:
            state === "eaten"
                ? `1px solid ${tint(color, 28)}`
                : state === "missed"
                  ? "1.5px dashed var(--bd2)"
                  : `1.5px dashed ${tint(color, 60)}`,
        opacity: state === "missed" ? 0.55 : 1,
    };
}

/** Planned + eaten kcal for a day; past days only count what was eaten. */
export function dayTotals(meals: PlannedMeal[], past: boolean) {
    const eaten = meals
        .filter((m) => m.status === "eaten")
        .reduce((sum, m) => sum + m.kcal, 0);
    const planned = past
        ? 0
        : meals
              .filter((m) => m.status !== "eaten")
              .reduce((sum, m) => sum + m.kcal, 0);
    return { eaten, planned, total: eaten + planned };
}
