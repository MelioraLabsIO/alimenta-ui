import {
    Banana,
    ChefHat,
    Citrus,
    Cookie,
    CookingPot,
    Drumstick,
    Egg,
    Fish,
    Flame,
    Globe,
    Link,
    Lock,
    Salad,
    Sandwich,
    Soup,
    Wheat,
    type LucideIcon,
} from "lucide-react";
import { COOK_RECIPE_COUNTS } from "@/core/mock/recipes";
import type {
    Recipe,
    RecipeHue,
    RecipeIconName,
    RecipeRegion,
    RecipeScope,
    RecipeVisibility,
} from "@/core/types/models/recipe";

export const RECIPE_ICONS: Record<RecipeIconName, LucideIcon> = {
    egg: Egg,
    drumstick: Drumstick,
    wheat: Wheat,
    banana: Banana,
    fish: Fish,
    soup: Soup,
    cookie: Cookie,
    salad: Salad,
    sandwich: Sandwich,
    flame: Flame,
    "cooking-pot": CookingPot,
    citrus: Citrus,
    "chef-hat": ChefHat,
};

export const VISIBILITY_META: Record<
    RecipeVisibility,
    { icon: LucideIcon; label: string; short: string; description: string }
> = {
    private: {
        icon: Lock,
        label: "Private",
        short: "Private",
        description: "Only you can see it.",
    },
    link: {
        icon: Link,
        label: "Anyone with the link",
        short: "Link",
        description:
            "Not listed in search. People with the link can view and save a copy.",
    },
    public: {
        icon: Globe,
        label: "Public in Alimenta",
        short: "Public",
        description: "Listed in the shared database for everyone to find.",
    },
};

export const VISIBILITIES: RecipeVisibility[] = ["private", "link", "public"];

/** The quick filters above the grid. "Under 30 min" is by time; the rest are tags. */
export const RECIPE_FILTERS = [
    "High protein",
    "Vegetarian",
    "Vegan",
    "Under 30 min",
    "Breakfast",
];

/** The "mine" tab fans out into these shelves. */
export const MINE_SCOPES: RecipeScope[] = ["mine", "private", "sharedByMe"];

export const tint = (color: string, pct: number) =>
    `color-mix(in srgb, ${color} ${pct}%, transparent)`;

export const hueColor = (hue: RecipeHue) => `var(--${hue})`;

/** The soft tile a recipe icon sits on. */
export const hueTile = (hue: RecipeHue) => tint(hueColor(hue), 16);

/** Avatar colours cycle through the four accents. */
export const AVATAR_HUES: RecipeHue[] = ["ac", "bl", "am", "ro"];

export const matchesFilter = (recipe: Recipe, filter: string | null) =>
    !filter ||
    (filter === "Under 30 min"
        ? recipe.minutes <= 30
        : recipe.tags.includes(filter));

export function matchesQuery(recipe: Recipe, query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [
        recipe.name,
        recipe.cuisine,
        recipe.author,
        recipe.place ?? "",
        ...recipe.tags,
        ...recipe.sections.flatMap((s) => s.ingredients.map((i) => i.name)),
    ]
        .join(" ")
        .toLowerCase()
        .includes(q);
}

export const isCommunity = (recipe: Recipe) =>
    !recipe.mine && recipe.visibility === "public";

export function inScope(
    recipe: Recipe,
    scope: RecipeScope,
    saved: Record<string, boolean>
) {
    switch (scope) {
        case "mine":
            return recipe.mine;
        case "private":
            return recipe.mine && recipe.visibility === "private";
        case "sharedByMe":
            return recipe.mine && recipe.visibility !== "private";
        case "saved":
            return !!saved[recipe.id];
        case "community":
            return isCommunity(recipe);
    }
}

/** "You" for own recipes, otherwise "Aiko Tan · Tokyo". */
export const authorLine = (recipe: Recipe) =>
    recipe.mine
        ? "You"
        : [recipe.author, recipe.place].filter(Boolean).join(" · ");

export type DiscoverCook = { name: string; place: string; count: number };

/**
 * What the Discover shelf shows for a region: the recipe of the week, the
 * most-saved, the quick high-protein ones and the cooks behind them.
 */
export function discoverShelves(
    recipes: Recipe[],
    region: RecipeRegion | null
) {
    const community = recipes.filter(isCommunity);
    const inRegion = community.filter((r) => !region || r.region === region);

    const featured =
        [...inRegion].sort(
            (a, b) =>
                Number(!!b.featured) - Number(!!a.featured) ||
                (b.rating ?? 0) * b.ratingCount -
                    (a.rating ?? 0) * a.ratingCount
        )[0] ?? null;
    const rest = inRegion.filter((r) => r !== featured);

    const trending = [...rest].sort((a, b) => b.saves - a.saves).slice(0, 6);
    const quick = rest
        .filter((r) => r.minutes <= 30)
        .sort((a, b) => (b.protein ?? 0) - (a.protein ?? 0))
        .slice(0, 6);

    const cooks: DiscoverCook[] = [...new Set(inRegion.map((r) => r.author))]
        .slice(0, 6)
        .map((name) => ({
            name,
            place: community.find((r) => r.author === name)?.place ?? "",
            count: COOK_RECIPE_COUNTS[name] ?? 10,
        }));

    return { featured, trending, quick, cooks };
}

export type MacroSlice = {
    label: string;
    grams: number;
    color: string;
    /** Share of calories, 0–100. */
    pct: number;
};

/** Protein / carbs / fat as shares of calories, or `null` when nutrition is unknown. */
export function macroSlices(recipe: Recipe): MacroSlice[] | null {
    if (recipe.protein == null || recipe.carbs == null || recipe.fat == null) {
        return null;
    }
    const slices = [
        {
            label: "Protein",
            grams: recipe.protein,
            perGram: 4,
            color: "var(--ac)",
        },
        { label: "Carbs", grams: recipe.carbs, perGram: 4, color: "var(--bl)" },
        { label: "Fat", grams: recipe.fat, perGram: 9, color: "var(--am)" },
    ];
    const total = slices.reduce((a, s) => a + s.grams * s.perGram, 0) || 1;
    return slices.map(({ label, grams, perGram, color }) => ({
        label,
        grams,
        color,
        pct: Math.round(((grams * perGram) / total) * 100),
    }));
}

export const fibreLabel = (fibre: number) =>
    fibre >= 8 ? "High" : fibre >= 4 ? "Good" : "Low";

/** Stable key for an ingredient row, used for check-offs and the shopping list. */
export const ingredientKey = (
    recipeId: string,
    sectionIndex: number,
    ingredientIndex: number
) => `${recipeId}:${sectionIndex}:${ingredientIndex}`;

/** Stable key for a step's timer; `n` is the step's running number across sections. */
export const stepKey = (recipeId: string, n: number) => `${recipeId}:${n}`;
