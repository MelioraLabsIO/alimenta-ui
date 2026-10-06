export type SettingsTab = "profile" | "goal" | "food" | "ai" | "account";

export type Goal = "cut" | "maintain" | "bulk";
export type Units = "metric" | "imperial";

export const GOALS: {
    value: Goal;
    label: string;
    description: string;
    /** Verb used in the "I want to … my weight" summary sentence. */
    verb: string;
    color: string;
    token: string;
}[] = [
    {
        value: "cut",
        label: "Cut",
        description: "Lose weight",
        verb: "lose",
        color: "rose",
        token: "var(--ro)",
    },
    {
        value: "maintain",
        label: "Maintain",
        description: "Stay steady",
        verb: "maintain",
        color: "alimenta",
        token: "var(--ac)",
    },
    {
        value: "bulk",
        label: "Bulk",
        description: "Gain muscle",
        verb: "build",
        color: "sky",
        token: "var(--bl)",
    },
];

export const UNIT_DESCRIPTIONS: Record<Units, string> = {
    metric: "Grams, millilitres, kilograms",
    imperial: "Ounces, fluid ounces, pounds",
};

/** Tint of a token at 16%, the design's chip/tile background. */
export const tint = (token: string, pct = 16) =>
    `color-mix(in srgb, ${token} ${pct}%, transparent)`;
