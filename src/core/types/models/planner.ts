import { EMealType } from "@/core/types/models/meal";

/** The meal slots a planner day is split into, in the order they're shown. */
export type PlannerSlot = Exclude<EMealType, EMealType.OTHER>;

export const PLANNER_SLOTS: PlannerSlot[] = [
    EMealType.BREAKFAST,
    EMealType.LUNCH,
    EMealType.SNACK,
    EMealType.DINNER,
];

/**
 * `planned` is an intention, `eaten` is confirmed. A planned meal on a past
 * day is shown as "missed" — that is derived, never stored.
 */
export type PlannedMealStatus = "planned" | "eaten";

export type PlannedMeal = {
    id: string;
    /** Local calendar day, `YYYY-MM-DD`. */
    date: string;
    slot: PlannerSlot;
    name: string;
    kcal: number;
    status: PlannedMealStatus;
};

/** Planned meals keyed by their `date`. */
export type PlannerMap = Record<string, PlannedMeal[]>;

/** An AI-proposed meal: what it is, and why it was picked for this user. */
export type MealSuggestion = {
    id: string;
    slot: PlannerSlot;
    name: string;
    kcal: number;
    reason: string;
};
