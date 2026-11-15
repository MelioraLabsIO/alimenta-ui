/**
 * Pure formatting helpers for the recipes page: ingredient amounts, step
 * timers, share links. No React so they can be unit-tested directly.
 */

import type { Recipe } from "@/core/types/models/recipe";

const FRACTIONS: [number, string][] = [
    [0.25, "¼"],
    [0.33, "⅓"],
    [0.5, "½"],
    [0.67, "⅔"],
    [0.75, "¾"],
];

/**
 * A scaled quantity, rounded the way a cook would: metric weights to the
 * nearest 5 g once past 50, kilos/litres past 1000, and vulgar fractions for
 * counted items ("1½ lemons").
 */
export function formatQuantity(quantity: number, unit: string): string {
    if (unit === "g" || unit === "ml") {
        if (quantity >= 1000) {
            return `${Math.round(quantity / 50) / 20} ${unit === "g" ? "kg" : "l"}`;
        }
        const rounded =
            quantity >= 50
                ? Math.round(quantity / 5) * 5
                : Math.round(quantity);
        return `${rounded} ${unit}`;
    }

    const whole = Math.floor(quantity);
    const frac = Math.round((quantity - whole) * 100) / 100;
    const vulgar = FRACTIONS.find(([f]) => Math.abs(f - frac) < 0.05);
    const text = vulgar
        ? `${whole || ""}${vulgar[1]}`
        : frac < 0.05
          ? String(whole)
          : String(Math.round(quantity * 10) / 10);
    return unit ? `${text} ${unit}` : text;
}

/** `formatQuantity`, or "to taste" when there's no quantity to scale. */
export function formatAmount(quantity: number | null, unit: string): string {
    return quantity == null ? "to taste" : formatQuantity(quantity, unit);
}

/**
 * Seconds implied by a step's text ("cook 5–6 minutes" → 360, taking the
 * upper bound), or 0 when it mentions no duration.
 */
export function timerSeconds(step: string): number {
    const match = step.match(/(\d+)(?:–(\d+))?\s*(minutes?|mins?|hours?)/i);
    if (!match) return 0;
    const n = Number(match[2] ?? match[1]);
    return n * (/^h/i.test(match[3]) ? 3600 : 60);
}

/** "5:07" */
export function formatClock(seconds: number): string {
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/** "20 min" or "1 h" */
export function formatDuration(seconds: number): string {
    return seconds >= 3600 ? `${seconds / 3600} h` : `${seconds / 60} min`;
}

/** "18.4k" style counts for saves and ratings. */
export function formatCount(n: number): string {
    if (n < 1000) return String(n);
    return `${(Math.round(n / 100) / 10).toString().replace(/\.0$/, "")}k`;
}

export function isUrl(text: string): boolean {
    return /^(https?:\/\/|www\.)\S+\.\S+/i.test(text.trim());
}

/** The hostname of a pasted link, without `www.`. */
export function hostOf(url: string): string {
    try {
        const href = /^https?:/.test(url) ? url : `https://${url}`;
        return new URL(href).hostname.replace(/^www\./, "");
    } catch {
        return "the page";
    }
}

/** The public URL a recipe is shared at. */
export function shareLink(recipe: Pick<Recipe, "id" | "name">): string {
    const slug = recipe.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    return `https://alimenta.app/r/${slug}-${recipe.id.slice(1)}k7`;
}
