import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CUISINES } from "./cuisines";
import {
    CUISINE_OPTIONS,
    findCuisineName,
    hasItem,
    uniqueItems,
    withFoodPreferences,
} from "./food-preferences";

const base = { id: "u1", firstName: "Ada", lastName: "L", email: "a@b.c" };

describe("withFoodPreferences", () => {
    it("fills in defaults for an API that doesn't send preferences yet", () => {
        assert.deepEqual(withFoodPreferences(base), {
            ...base,
            dietType: null,
            cookingTimePreference: null,
            foodDoneness: null,
            allergies: [],
            dislikes: [],
            favoriteCuisines: [],
        });
    });

    it("keeps known values and drops unknown ones", () => {
        const profile = withFoodPreferences({
            ...base,
            dietType: "low_carb",
            cookingTimePreference: "slow",
            foodDoneness: "well_done",
            allergies: ["Peanuts"],
            dislikes: null,
            favoriteCuisines: ["Cuban"],
        });

        assert.equal(profile.dietType, "low_carb");
        assert.equal(profile.cookingTimePreference, null);
        assert.equal(profile.foodDoneness, "well_done");
        assert.deepEqual(profile.allergies, ["Peanuts"]);
        assert.deepEqual(profile.dislikes, []);
        assert.deepEqual(profile.favoriteCuisines, ["Cuban"]);
    });
});

describe("cuisines", () => {
    it("finds a cuisine by name in any case", () => {
        assert.equal(findCuisineName(" italian "), "Italian");
        assert.equal(findCuisineName("Martian"), null);
    });

    it("groups every cuisine exactly once by region", () => {
        const names = CUISINE_OPTIONS.flatMap((group) => group.items);
        assert.equal(names.length, CUISINES.length);
        assert.equal(new Set(names).size, CUISINES.length);
    });
});

describe("list helpers", () => {
    it("compares items ignoring case and spacing", () => {
        assert.equal(hasItem(["Peanuts"], " peanuts"), true);
        assert.equal(hasItem(["Peanuts"], "Pecans"), false);
    });

    it("trims and drops blanks and repeats, keeping the first spelling", () => {
        assert.deepEqual(uniqueItems([" Gluten", "gluten", "", "Soy "]), [
            "Gluten",
            "Soy",
        ]);
    });
});
