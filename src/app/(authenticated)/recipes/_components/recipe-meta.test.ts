import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { seedRecipes } from "@/core/mock/recipes";
import {
    discoverShelves,
    inScope,
    macroSlices,
    matchesFilter,
    matchesQuery,
} from "./recipe-meta";

const recipes = seedRecipes();
const byId = (id: string) => recipes.find((r) => r.id === id)!;

describe("inScope", () => {
    it("splits the library into the shelves the tabs show", () => {
        const scoped = (scope: Parameters<typeof inScope>[1]) =>
            recipes
                .filter((r) => inScope(r, scope, { r4: true }))
                .map((r) => r.id);

        assert.deepEqual(scoped("mine"), ["r1", "r3", "r2", "r7"]);
        assert.deepEqual(scoped("private"), ["r1", "r7"]);
        assert.deepEqual(scoped("sharedByMe"), ["r3", "r2"]);
        assert.deepEqual(scoped("saved"), ["r4"]);
        assert.equal(scoped("community").includes("r1"), false);
    });
});

describe("search and filters", () => {
    it("matches on name, cuisine, author, place, tags and ingredients", () => {
        const dal = byId("r5");
        assert.equal(matchesQuery(dal, "Mumbai"), true);
        assert.equal(matchesQuery(dal, "curry leaves"), true);
        assert.equal(matchesQuery(dal, "salmon"), false);
        assert.equal(matchesQuery(dal, "  "), true);
    });

    it("treats 'Under 30 min' as a time filter and the rest as tags", () => {
        assert.equal(matchesFilter(byId("r8"), "Under 30 min"), true);
        assert.equal(matchesFilter(byId("c7"), "Under 30 min"), false);
        assert.equal(matchesFilter(byId("c7"), "Vegan"), true);
        assert.equal(matchesFilter(byId("c7"), null), true);
    });
});

describe("discoverShelves", () => {
    it("features the flagged recipe and keeps it out of the other rows", () => {
        const { featured, trending, quick } = discoverShelves(recipes, null);
        assert.equal(featured?.id, "c1");
        assert.equal(
            trending.some((r) => r.id === "c1"),
            false
        );
        assert.equal(trending[0].id, "r5");
        assert.ok(quick.every((r) => r.minutes <= 30));
    });

    it("narrows to a region, picking the best-rated recipe there", () => {
        const { featured, cooks } = discoverShelves(recipes, "Latin America");
        assert.equal(featured?.id, "c2");
        assert.deepEqual(
            cooks.map((c) => c.name),
            ["Lucas Mendes", "Valeria Ruiz", "Mateo Quispe"]
        );
    });

    it("never includes the user's own recipes", () => {
        const { trending, quick } = discoverShelves(recipes, null);
        assert.ok([...trending, ...quick].every((r) => !r.mine));
    });
});

describe("macroSlices", () => {
    it("shares calories by 4/4/9 and sums to about 100", () => {
        const slices = macroSlices(byId("r4"))!;
        assert.deepEqual(
            slices.map((s) => s.label),
            ["Protein", "Carbs", "Fat"]
        );
        const total = slices.reduce((a, s) => a + s.pct, 0);
        assert.ok(total >= 99 && total <= 101);
    });

    it("is null until nutrition is known", () => {
        assert.equal(macroSlices({ ...byId("r4"), carbs: null }), null);
    });
});
