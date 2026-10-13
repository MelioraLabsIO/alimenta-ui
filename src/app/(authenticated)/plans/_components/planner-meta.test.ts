import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EMealType } from "@/core/types/models/meal";
import type { PlannedMeal, PlannerSlot } from "@/core/types/models/planner";
import {
    dayStateCounts,
    daySummary,
    kcalShares,
    missingSlots,
} from "./planner-meta";

let id = 0;
const meal = (
    slot: PlannerSlot,
    kcal: number,
    status: PlannedMeal["status"]
): PlannedMeal => ({
    id: `m${++id}`,
    date: "2026-10-12",
    slot,
    name: "Meal",
    kcal,
    status,
});

const day = [
    meal(EMealType.BREAKFAST, 300, "eaten"),
    meal(EMealType.LUNCH, 600, "planned"),
    meal(EMealType.DINNER, 500, "planned"),
];

describe("dayStateCounts", () => {
    it("counts unfinished meals as planned on a current or future day", () => {
        assert.deepEqual(dayStateCounts(day, false), {
            eaten: 1,
            planned: 2,
            missed: 0,
        });
    });

    it("counts unfinished meals as missed on a past day", () => {
        assert.deepEqual(dayStateCounts(day, true), {
            eaten: 1,
            planned: 0,
            missed: 2,
        });
    });
});

describe("daySummary", () => {
    it("reports calories left and the per-state counts", () => {
        assert.deepEqual(daySummary(day, false), {
            main: "850 kcal left",
            sub: "1 eaten · 2 planned",
        });
    });

    it("reports only eaten calories for a past day", () => {
        assert.deepEqual(daySummary(day, true), {
            main: "300 of 2,250 kcal",
            sub: "1 eaten · 2 missed",
        });
    });

    it("reports calories over the target", () => {
        const heavy = [...day, meal(EMealType.SNACK, 1000, "planned")];
        assert.equal(daySummary(heavy, false).main, "150 kcal over");
    });

    it("handles empty days", () => {
        assert.deepEqual(daySummary([], false), {
            main: "Nothing planned",
            sub: "—",
        });
        assert.equal(daySummary([], true).main, "Nothing logged");
    });
});

describe("kcalShares", () => {
    it("caps the bar at 100%", () => {
        assert.deepEqual(kcalShares({ eaten: 2250, planned: 900 }), {
            eatenPct: 100,
            plannedPct: 0,
        });
    });
});

describe("missingSlots", () => {
    it("lists main meals without a plan and ignores snacks", () => {
        assert.deepEqual(missingSlots([day[0]]), [
            EMealType.LUNCH,
            EMealType.DINNER,
        ]);
    });
});
