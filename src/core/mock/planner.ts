// src/core/mock/planner.ts
//
// Mock planner data until the planner endpoints exist. Generation is
// deterministic for a given day so the board doesn't reshuffle on re-render.

import { EMealType } from "@/core/types/models/meal";
import type {
    MealSuggestion,
    PlannedMeal,
    PlannerMap,
    PlannerSlot,
} from "@/core/types/models/planner";
import { addDays, toDayKey } from "@/lib/planner-dates";

const LIBRARY: Record<PlannerSlot, [string, number][]> = {
    [EMealType.BREAKFAST]: [
        ["Overnight oats", 380],
        ["Greek yogurt bowl", 320],
        ["Avocado toast", 410],
        ["Veggie omelette", 350],
        ["Berry smoothie", 290],
    ],
    [EMealType.LUNCH]: [
        ["Quinoa salad", 520],
        ["Chickpea wrap", 560],
        ["Lentil soup", 430],
        ["Tofu poke bowl", 610],
        ["Caprese sandwich", 540],
    ],
    [EMealType.DINNER]: [
        ["Tofu stir-fry", 580],
        ["Mushroom risotto", 690],
        ["Black bean tacos", 620],
        ["Halloumi traybake", 650],
        ["Veggie curry", 600],
    ],
    [EMealType.SNACK]: [
        ["Apple & almonds", 210],
        ["Hummus & carrots", 180],
        ["Protein shake", 230],
        ["Dark chocolate", 150],
    ],
};

const REASONS = [
    "fits your target",
    "high protein",
    "15 min",
    "you rated it 5★",
    "uses leftovers",
];

/** Seeded pseudo-random in [0, 1). */
function rand(n: number): number {
    const x = Math.sin(n * 9301 + 49297) * 233280;
    return x - Math.floor(x);
}

function hashString(s: string): number {
    return [...s].reduce((a, c, i) => a + c.charCodeAt(0) * (i + 1), 0);
}

function pick<T>(list: T[], seed: number): T {
    return list[Math.floor(rand(seed) * list.length)];
}

let nextId = 1;
export function newPlannedMealId(): string {
    return `plan-${Date.now().toString(36)}-${nextId++}`;
}

/**
 * ±45 days around `today`: past days are mostly eaten (a few missed), today is
 * half eaten, and the coming week thins out the further ahead it goes.
 */
export function seedPlannedMeals(today: Date): PlannerMap {
    const plans: PlannerMap = {};
    const slots: PlannerSlot[] = [
        EMealType.BREAKFAST,
        EMealType.LUNCH,
        EMealType.DINNER,
        EMealType.SNACK,
    ];

    for (let i = -45; i <= 45; i++) {
        const date = toDayKey(addDays(today, i));
        const items: PlannedMeal[] = [];

        slots.forEach((slot, si) => {
            const isSnack = slot === EMealType.SNACK;
            const chance =
                i < 0
                    ? isSnack
                        ? 0.45
                        : 0.92
                    : i === 0
                      ? isSnack
                          ? 0.3
                          : 1
                      : i <= 5
                        ? isSnack
                            ? 0.15
                            : 0.6
                        : i <= 12
                          ? 0.22
                          : 0.04;
            if (rand(i * 7 + si) >= chance) return;

            const [name, kcal] = pick(LIBRARY[slot], i * 13 + si * 3);
            const eatenToday =
                slot === EMealType.BREAKFAST || slot === EMealType.LUNCH;
            const status =
                i < 0
                    ? rand(i * 5 + si) < 0.12
                        ? "planned"
                        : "eaten"
                    : i === 0 && eatenToday
                      ? "eaten"
                      : "planned";

            items.push({
                id: `seed-${i}-${si}`,
                date,
                slot,
                name,
                kcal,
                status,
            });
        });

        if (items.length) plans[date] = items;
    }

    return plans;
}

/**
 * A suggestion for `slot`, varied by `context` (a day key or tray id),
 * `salt` (position) and `round` (bumped by "New ideas").
 */
export function suggestMeal(
    slot: PlannerSlot,
    context: string,
    salt: number,
    round: number
): MealSuggestion {
    const base = hashString(context);
    const [name, kcal] = pick(LIBRARY[slot], base + salt * 17 + round * 31);
    return {
        id: `${context}-${slot}-${salt}-${round}`,
        slot,
        name,
        kcal,
        reason: pick(REASONS, base + salt + round),
    };
}

const TRAY_SLOTS: PlannerSlot[] = [
    EMealType.BREAKFAST,
    EMealType.LUNCH,
    EMealType.DINNER,
    EMealType.SNACK,
    EMealType.LUNCH,
    EMealType.DINNER,
];

/** The six AI-tray ideas shown for the week starting `weekKey`. */
export function suggestTray(weekKey: string, round: number): MealSuggestion[] {
    return TRAY_SLOTS.map((slot, i) =>
        suggestMeal(slot, `tray-${weekKey}`, i, round)
    );
}

/** Fills missing breakfast/lunch/dinner on each remaining day of a week. */
export function fillWeekWithAi(
    plans: PlannerMap,
    days: Date[],
    today: Date,
    round: number
): { plans: PlannerMap; added: PlannedMeal[] } {
    const next = { ...plans };
    const added: PlannedMeal[] = [];
    const core: PlannerSlot[] = [
        EMealType.BREAKFAST,
        EMealType.LUNCH,
        EMealType.DINNER,
    ];

    days.forEach((day, i) => {
        if (day < today) return;
        const date = toDayKey(day);
        const items = [...(next[date] ?? [])];

        core.forEach((slot, si) => {
            if (items.some((x) => x.slot === slot)) return;
            const [name, kcal] = pick(
                LIBRARY[slot],
                i * 11 + si * 5 + round * 3 + 7
            );
            const meal: PlannedMeal = {
                id: newPlannedMealId(),
                date,
                slot,
                name,
                kcal,
                status: "planned",
            };
            items.push(meal);
            added.push(meal);
        });

        next[date] = items;
    });

    return { plans: next, added };
}
