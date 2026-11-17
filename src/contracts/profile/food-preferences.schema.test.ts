import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    foodPreferencesSchema,
    NO_ALLERGIES_MESSAGE,
    toFoodPreferencesFormValues,
    toFoodPreferencesUpdate,
    type FoodPreferencesInput,
} from "./food-preferences.schema";

const valid: FoodPreferencesInput = {
    allergies: ["Peanuts"],
    noAllergies: false,
    dislikes: [],
    dietType: null,
    cookingTimePreference: null,
    foodDoneness: null,
    favoriteCuisines: [],
};

function issues(input: FoodPreferencesInput) {
    const result = foodPreferencesSchema.safeParse(input);
    return result.success
        ? []
        : result.error.issues.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message,
          }));
}

describe("foodPreferencesSchema", () => {
    it("accepts allergies with every optional field left blank", () => {
        assert.deepEqual(issues(valid), []);
    });

    it("requires allergies unless the user says they have none", () => {
        assert.deepEqual(issues({ ...valid, allergies: [] }), [
            { path: "allergies", message: NO_ALLERGIES_MESSAGE },
        ]);
        assert.deepEqual(
            issues({ ...valid, allergies: [], noAllergies: true }),
            []
        );
    });

    it("only takes the API's single-choice values", () => {
        assert.deepEqual(
            issues({
                ...valid,
                dietType: "high_protein",
                cookingTimePreference: "quick",
                foodDoneness: "almost_raw",
            }),
            []
        );
        assert.equal(
            issues({
                ...valid,
                dietType: "paleo" as FoodPreferencesInput["dietType"],
            })[0]?.path,
            "dietType"
        );
    });

    it("only takes cuisines from the list, in any case", () => {
        assert.deepEqual(
            issues({ ...valid, favoriteCuisines: ["Cuban", "italian"] }),
            []
        );
        assert.equal(
            issues({ ...valid, favoriteCuisines: ["Martian"] })[0]?.path,
            "favoriteCuisines.0"
        );
    });

    it("keeps lists within the API's limits", () => {
        const many = Array.from({ length: 51 }, (_, i) => `Food ${i}`);
        assert.equal(issues({ ...valid, dislikes: many })[0]?.path, "dislikes");
        assert.equal(
            issues({ ...valid, dislikes: ["x".repeat(256)] })[0]?.path,
            "dislikes.0"
        );
        assert.equal(
            issues({ ...valid, dislikes: ["   "] })[0]?.path,
            "dislikes.0"
        );
    });
});

describe("toFoodPreferencesUpdate", () => {
    it("sends every field, clearing blank choices with an empty string", () => {
        const values = foodPreferencesSchema.parse({
            ...valid,
            allergies: [" Peanuts ", "peanuts", "Shellfish"],
            dislikes: ["Mushrooms"],
            dietType: "keto",
            favoriteCuisines: ["cuban", "Cuban", "Italian"],
        });

        assert.deepEqual(toFoodPreferencesUpdate(values), {
            allergies: ["Peanuts", "Shellfish"],
            dislikes: ["Mushrooms"],
            dietType: "keto",
            cookingTimePreference: "",
            foodDoneness: "",
            favoriteCuisines: ["Cuban", "Italian"],
        });
    });

    it("saves no allergies as an empty list", () => {
        const values = foodPreferencesSchema.parse({
            ...valid,
            allergies: [],
            noAllergies: true,
        });
        assert.deepEqual(toFoodPreferencesUpdate(values).allergies, []);
    });
});

describe("toFoodPreferencesFormValues", () => {
    it("starts from the saved profile with the no-allergies box unticked", () => {
        assert.deepEqual(
            toFoodPreferencesFormValues({
                allergies: [],
                dislikes: ["Olives"],
                dietType: "vegan",
                cookingTimePreference: "normal",
                foodDoneness: null,
                favoriteCuisines: ["Thai"],
            }),
            {
                allergies: [],
                noAllergies: false,
                dislikes: ["Olives"],
                dietType: "vegan",
                cookingTimePreference: "normal",
                foodDoneness: null,
                favoriteCuisines: ["Thai"],
            }
        );
    });
});
