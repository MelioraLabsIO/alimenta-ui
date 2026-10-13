import { Apple, Moon, Sun, Sunrise, type LucideIcon } from "lucide-react";
import { EMealType } from "@/core/types/models/meal";
import {
    PLANNER_SLOTS,
    type PlannedMeal,
    type PlannerSlot,
} from "@/core/types/models/planner";

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

const MAIN_SLOTS: PlannerSlot[] = [
    EMealType.BREAKFAST,
    EMealType.LUNCH,
    EMealType.DINNER,
];

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

export const sortBySlot = (meals: PlannedMeal[]) =>
    [...meals].sort(
        (a, b) => PLANNER_SLOTS.indexOf(a.slot) - PLANNER_SLOTS.indexOf(b.slot)
    );

/** Widths of the eaten / planned segments of a day's calorie bar, in %. */
export function kcalShares({
    eaten,
    planned,
}: {
    eaten: number;
    planned: number;
}) {
    const eatenPct = Math.min(100, (eaten / DAILY_KCAL_TARGET) * 100);
    const plannedPct = Math.min(
        100 - eatenPct,
        (planned / DAILY_KCAL_TARGET) * 100
    );
    return { eatenPct, plannedPct };
}

/** How many of a day's meals are eaten, planned and missed. */
export function dayStateCounts(meals: PlannedMeal[], past: boolean) {
    const counts: Record<MealVisualState, number> = {
        eaten: 0,
        planned: 0,
        missed: 0,
    };
    for (const meal of meals) counts[mealState(meal, past)]++;
    return counts;
}

/**
 * The two footer lines of a week-board day: calories against the target,
 * then the per-state meal counts ("2 eaten · 1 planned").
 */
export function daySummary(meals: PlannedMeal[], past: boolean) {
    const { eaten, total } = dayTotals(meals, past);
    const left = DAILY_KCAL_TARGET - total;
    const main = past
        ? eaten
            ? `${formatKcal(eaten)} of ${formatKcal(DAILY_KCAL_TARGET)} kcal`
            : "Nothing logged"
        : total
          ? left >= 0
              ? `${formatKcal(left)} kcal left`
              : `${formatKcal(-left)} kcal over`
          : "Nothing planned";

    const counts = dayStateCounts(meals, past);
    const sub =
        (["eaten", "planned", "missed"] as const)
            .filter((state) => counts[state] > 0)
            .map((state) => `${counts[state]} ${state}`)
            .join(" · ") || "—";

    return { main, sub };
}

/** Main meals a planned day still lacks — snacks are optional. */
export function missingSlots(meals: PlannedMeal[]): PlannerSlot[] {
    return MAIN_SLOTS.filter((slot) => !meals.some((m) => m.slot === slot));
}
