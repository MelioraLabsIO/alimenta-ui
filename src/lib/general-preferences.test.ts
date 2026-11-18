import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    changedGeneralPreferences,
    toGeneralPreferencesValues,
} from "./general-preferences";

describe("toGeneralPreferencesValues", () => {
    it("shows maintain and metric until the user picks", () => {
        assert.deepEqual(toGeneralPreferencesValues(null), {
            goal: "maintain",
            units: "metric",
        });
        assert.deepEqual(
            toGeneralPreferencesValues({ goal: null, units: null }),
            { goal: "maintain", units: "metric" }
        );
    });

    it("keeps saved values", () => {
        assert.deepEqual(
            toGeneralPreferencesValues({ goal: "cut", units: "imperial" }),
            { goal: "cut", units: "imperial" }
        );
    });
});

describe("changedGeneralPreferences", () => {
    const saved = { goal: "maintain", units: "metric" } as const;

    it("is empty when nothing changed", () => {
        assert.deepEqual(changedGeneralPreferences(saved, { ...saved }), {});
    });

    it("sends only the fields that changed", () => {
        assert.deepEqual(
            changedGeneralPreferences(saved, { ...saved, units: "imperial" }),
            { units: "imperial" }
        );
        assert.deepEqual(
            changedGeneralPreferences(saved, {
                goal: "bulk",
                units: "imperial",
            }),
            { goal: "bulk", units: "imperial" }
        );
    });
});
