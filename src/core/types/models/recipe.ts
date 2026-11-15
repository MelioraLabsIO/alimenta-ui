/** Who can see a recipe. `link` is unlisted but viewable by anyone holding the URL. */
export type RecipeVisibility = "private" | "link" | "public";

/** Accent used for a recipe's placeholder tile — a key into the `--ac/--bl/--am/--ro` tokens. */
export type RecipeHue = "ac" | "bl" | "am" | "ro";

export type RecipeIconName =
    | "egg"
    | "drumstick"
    | "wheat"
    | "banana"
    | "fish"
    | "soup"
    | "cookie"
    | "salad"
    | "sandwich"
    | "flame"
    | "cooking-pot"
    | "citrus"
    | "chef-hat";

export const RECIPE_REGIONS = [
    "Asia",
    "Latin America",
    "Mediterranean",
    "Africa & Middle East",
] as const;
export type RecipeRegion = (typeof RECIPE_REGIONS)[number];

export type Ingredient = {
    /** `null` means "to taste" — no amount to scale. */
    quantity: number | null;
    /** Free text: `g`, `ml`, `tbsp`, `cans`… or empty for whole items. */
    unit: string;
    name: string;
    note: string;
};

/** Ingredients and steps grouped under one heading ("Glaze", "Tray"). */
export type RecipeSection = {
    name: string;
    ingredients: Ingredient[];
    steps: string[];
};

export type RecipeComment = {
    author: string;
    place: string;
    stars: number | null;
    when: string;
    text: string;
};

export type RecipeRemixRef = { name: string; author: string };

/** The recipe a remix was forked from. `id` is absent when the original isn't in the library. */
export type RecipeOrigin = { id?: string; name: string; author: string };

export type Recipe = {
    id: string;
    name: string;
    author: string;
    place?: string;
    region?: RecipeRegion;
    /** Written (or saved as a copy) by the signed-in user. */
    mine: boolean;
    visibility: RecipeVisibility;
    /** Host the recipe was imported from, when it was. */
    source?: string;
    cuisine: string;
    minutes: number;
    /** Per serving. `null` until ingredients are matched to Alimenta foods. */
    kcal: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
    fibre: number | null;
    servings: number;
    icon: RecipeIconName;
    hue: RecipeHue;
    tags: string[];
    rating: number | null;
    ratingCount: number;
    saves: number;
    featured?: boolean;
    /** Data URL of the cover photo. */
    photo?: string | null;
    /** A new recipe that hasn't been saved yet. */
    draft?: boolean;
    basedOn?: RecipeOrigin;
    remixes: RecipeRemixRef[];
    comments: RecipeComment[];
    sections: RecipeSection[];
};

/** Which shelf of the library is open. */
export type RecipeScope =
    | "community"
    | "mine"
    | "private"
    | "sharedByMe"
    | "saved";

export type ShoppingItem = {
    /** `${recipeId}:${sectionIndex}:${ingredientIndex}` */
    key: string;
    name: string;
    /** Already scaled and formatted, e.g. "250 g". */
    amount: string;
    /** Recipe name it came from. */
    from: string;
    done: boolean;
};

export type StepTimer = {
    /** Seconds remaining. */
    left: number;
    running: boolean;
    done: boolean;
};
