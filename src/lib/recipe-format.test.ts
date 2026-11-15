import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    formatAmount,
    formatClock,
    formatCount,
    formatDuration,
    formatQuantity,
    hostOf,
    isUrl,
    shareLink,
    timerSeconds,
} from "./recipe-format";

describe("formatQuantity", () => {
    it("rounds metric weights to 5 g once past 50", () => {
        assert.equal(formatQuantity(23.4, "g"), "23 g");
        assert.equal(formatQuantity(152, "g"), "150 g");
        assert.equal(formatQuantity(1500, "ml"), "1.5 l");
    });

    it("uses vulgar fractions for counted items", () => {
        assert.equal(formatQuantity(1.5, ""), "1½");
        assert.equal(formatQuantity(0.25, ""), "¼");
        assert.equal(formatQuantity(2, "tbsp"), "2 tbsp");
        assert.equal(formatQuantity(1.4, "tsp"), "1.4 tsp");
    });

    it("says 'to taste' for missing quantities", () => {
        assert.equal(formatAmount(null, ""), "to taste");
    });
});

describe("timerSeconds", () => {
    it("reads a range as its upper bound", () => {
        assert.equal(timerSeconds("Cover and cook 5–6 minutes."), 360);
    });

    it("understands hours and ignores steps without a duration", () => {
        assert.equal(timerSeconds("Chill for 2 hours."), 7200);
        assert.equal(timerSeconds("Whisk together."), 0);
    });
});

describe("clock formatting", () => {
    it("formats remaining time and durations", () => {
        assert.equal(formatClock(367), "6:07");
        assert.equal(formatDuration(1200), "20 min");
        assert.equal(formatDuration(3600), "1 h");
    });
});

describe("formatCount", () => {
    it("abbreviates thousands", () => {
        assert.equal(formatCount(870), "870");
        assert.equal(formatCount(18400), "18.4k");
        assert.equal(formatCount(5000), "5k");
    });
});

describe("links", () => {
    it("detects pasted URLs", () => {
        assert.equal(isUrl("https://www.cookingwithrosa.com/tacos"), true);
        assert.equal(isUrl("www.bbc.co.uk/food"), true);
        assert.equal(isUrl("chickpea tacos"), false);
    });

    it("extracts the host", () => {
        assert.equal(
            hostOf("https://www.cookingwithrosa.com/tacos"),
            "cookingwithrosa.com"
        );
        assert.equal(hostOf("not a url"), "the page");
    });

    it("builds a slugged share link", () => {
        assert.equal(
            shareLink({ id: "r6", name: "Pão de queijo" }),
            "https://alimenta.app/r/pao-de-queijo-6k7"
        );
    });
});
