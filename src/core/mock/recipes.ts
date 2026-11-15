/**
 * Mock recipe library until the recipes API lands. Mirrors the sample data in
 * the Claude Design frame so the page looks the way the design does.
 */

import type {
    Ingredient,
    Recipe,
    RecipeComment,
    RecipeHue,
    RecipeIconName,
    RecipeRegion,
    RecipeRemixRef,
    RecipeSection,
    RecipeVisibility,
} from "@/core/types/models/recipe";

type IngredientRow = [
    quantity: number | null,
    unit: string,
    name: string,
    note?: string,
];

const section = (
    name: string,
    rows: IngredientRow[],
    steps: string[]
): RecipeSection => ({
    name,
    ingredients: rows.map(([quantity, unit, name, note]) => ({
        quantity,
        unit,
        name,
        note: note ?? "",
    })),
    steps,
});

const comment = (
    author: string,
    place: string,
    stars: number,
    when: string,
    text: string
): RecipeComment => ({ author, place, stars, when, text });

type Seed = {
    id: string;
    name: string;
    author: string;
    place?: string;
    region?: RecipeRegion;
    mine: boolean;
    visibility: RecipeVisibility;
    source?: string;
    cuisine: string;
    minutes: number;
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
    fibre: number;
    servings: number;
    icon: RecipeIconName;
    hue: RecipeHue;
    tags: string[];
    rating?: number;
    ratingCount?: number;
    saves?: number;
    featured?: boolean;
    basedOn?: Recipe["basedOn"];
    remixes?: RecipeRemixRef[];
    comments?: RecipeComment[];
    sections: RecipeSection[];
};

const SEEDS: Seed[] = [
    {
        id: "r1",
        name: "Green shakshuka",
        author: "You",
        mine: true,
        visibility: "private",
        cuisine: "Middle Eastern",
        minutes: 25,
        kcal: 410,
        protein: 24,
        carbs: 14,
        fat: 27,
        fibre: 5,
        servings: 2,
        icon: "egg",
        hue: "ac",
        tags: ["Vegetarian", "High protein"],
        basedOn: { name: "Classic shakshuka", author: "Noa Levi" },
        sections: [
            section(
                "Base",
                [
                    [2, "tbsp", "Olive oil"],
                    [1, "", "Leek", "thinly sliced"],
                    [1, "", "Garlic clove", "grated"],
                    [150, "g", "Baby spinach"],
                    [1, "tsp", "Ground cumin"],
                ],
                [
                    "Warm the oil in a wide pan and soften the leek for 6 minutes.",
                    "Add garlic and cumin for 30 seconds, then wilt in the spinach.",
                ]
            ),
            section(
                "Eggs & topping",
                [
                    [4, "", "Eggs"],
                    [60, "g", "Feta", "crumbled"],
                    [0.5, "", "Lemon", "zest only"],
                    [null, "", "Chilli flakes", "to taste"],
                ],
                [
                    "Make four wells, crack in the eggs, cover and cook 5–6 minutes.",
                    "Finish with feta, lemon zest and chilli.",
                ]
            ),
        ],
    },
    {
        id: "r3",
        name: "Chicken shawarma bowl",
        author: "You",
        mine: true,
        visibility: "public",
        cuisine: "Levantine",
        minutes: 40,
        kcal: 620,
        protein: 46,
        carbs: 58,
        fat: 22,
        fibre: 4,
        servings: 4,
        icon: "drumstick",
        hue: "ro",
        tags: ["High protein", "Meal prep"],
        rating: 4.7,
        ratingCount: 128,
        remixes: [{ name: "Halloumi shawarma bowl", author: "Sam R." }],
        comments: [
            comment(
                "Jonas K.",
                "Berlin",
                5,
                "2 days ago",
                "Pickled onion makes it. I doubled the garlic sauce."
            ),
            comment(
                "Ana P.",
                "Lisbon",
                4,
                "1 week ago",
                "Used chicken breast — 20 minutes was plenty."
            ),
        ],
        sections: [
            section(
                "Chicken",
                [
                    [600, "g", "Chicken thighs", "boneless"],
                    [2, "tbsp", "Shawarma spice"],
                    [3, "tbsp", "Olive oil"],
                    [1, "", "Lemon", "juiced"],
                ],
                [
                    "Marinate the chicken for at least 30 minutes.",
                    "Roast at 220°C for 25 minutes, rest, then slice.",
                ]
            ),
            section(
                "Garlic sauce",
                [
                    [150, "g", "Greek yogurt"],
                    [2, "", "Garlic cloves", "grated"],
                    [1, "tbsp", "Tahini"],
                ],
                ["Whisk together and season with salt."]
            ),
            section(
                "Bowl",
                [
                    [200, "g", "Basmati rice", "dry weight"],
                    [1, "", "Cucumber", "diced"],
                    [200, "g", "Cherry tomatoes", "halved"],
                    [1, "", "Red onion", "quick-pickled"],
                ],
                [
                    "Cook the rice. Build bowls with rice, chicken, veg and a spoon of sauce.",
                ]
            ),
        ],
    },
    {
        id: "r2",
        name: "Overnight oats",
        author: "You",
        mine: true,
        visibility: "link",
        cuisine: "Breakfast",
        minutes: 5,
        kcal: 380,
        protein: 18,
        carbs: 48,
        fat: 11,
        fibre: 8,
        servings: 1,
        icon: "wheat",
        hue: "am",
        tags: ["Breakfast", "Vegetarian"],
        rating: 4.4,
        ratingCount: 6,
        comments: [
            comment("Mia", "London", 4, "3 days ago", "Added cinnamon, great."),
        ],
        sections: [
            section(
                "Oats",
                [
                    [50, "g", "Rolled oats"],
                    [150, "ml", "Milk"],
                    [100, "g", "Greek yogurt"],
                    [1, "tbsp", "Chia seeds"],
                    [1, "tsp", "Honey"],
                ],
                [
                    "Stir everything together in a jar.",
                    "Chill overnight; top with berries in the morning.",
                ]
            ),
        ],
    },
    {
        id: "r7",
        name: "Banana protein pancakes",
        author: "You",
        mine: true,
        visibility: "private",
        source: "bbcgoodfood.com",
        cuisine: "American",
        minutes: 15,
        kcal: 330,
        protein: 27,
        carbs: 34,
        fat: 9,
        fibre: 4,
        servings: 2,
        icon: "banana",
        hue: "am",
        tags: ["Breakfast", "High protein", "Vegetarian"],
        sections: [
            section(
                "Batter",
                [
                    [2, "", "Ripe bananas"],
                    [3, "", "Eggs"],
                    [30, "g", "Protein powder"],
                    [40, "g", "Oat flour"],
                    [0.5, "tsp", "Baking powder"],
                ],
                [
                    "Mash the bananas, then whisk in everything else.",
                    "Cook small pancakes for 2 minutes per side.",
                ]
            ),
        ],
    },
    {
        id: "r4",
        name: "Miso salmon traybake",
        author: "Aiko Tan",
        place: "Tokyo",
        region: "Asia",
        mine: false,
        visibility: "public",
        cuisine: "Japanese",
        minutes: 30,
        kcal: 540,
        protein: 38,
        carbs: 12,
        fat: 30,
        fibre: 4,
        servings: 2,
        icon: "fish",
        hue: "bl",
        tags: ["High protein"],
        rating: 4.8,
        ratingCount: 2400,
        saves: 12900,
        remixes: [
            { name: "Miso tofu traybake", author: "Lena W." },
            { name: "Gochujang salmon traybake", author: "Min-jun P." },
        ],
        comments: [
            comment(
                "Tom H.",
                "Manchester",
                5,
                "Yesterday",
                "Weeknight staple now. Grill for the last 2 minutes for a char."
            ),
            comment(
                "Carla V.",
                "Milan",
                5,
                "4 days ago",
                "Worked perfectly with trout."
            ),
            comment(
                "Dev S.",
                "Toronto",
                4,
                "2 weeks ago",
                "A bit salty with dark miso — stick to white."
            ),
        ],
        sections: [
            section(
                "Glaze",
                [
                    [2, "tbsp", "White miso"],
                    [1, "tbsp", "Mirin"],
                    [1, "tsp", "Soy sauce"],
                    [1, "tsp", "Fresh ginger", "grated"],
                ],
                ["Mix the glaze until smooth."]
            ),
            section(
                "Tray",
                [
                    [2, "", "Salmon fillets", "skin on"],
                    [250, "g", "Tenderstem broccoli"],
                    [1, "tbsp", "Sesame seeds"],
                ],
                [
                    "Brush the salmon with glaze and add the broccoli to the tray.",
                    "Roast at 200°C for 14 minutes; scatter with sesame.",
                ]
            ),
        ],
    },
    {
        id: "r5",
        name: "Red lentil dal with tadka",
        author: "Priya Raman",
        place: "Mumbai",
        region: "Asia",
        mine: false,
        visibility: "public",
        cuisine: "Indian",
        minutes: 35,
        kcal: 450,
        protein: 22,
        carbs: 52,
        fat: 18,
        fibre: 12,
        servings: 4,
        icon: "soup",
        hue: "am",
        tags: ["Vegan", "Vegetarian"],
        rating: 4.9,
        ratingCount: 5100,
        saves: 27300,
        remixes: [{ name: "Spinach dal", author: "Hannah O." }],
        comments: [
            comment(
                "Ravi M.",
                "London",
                5,
                "1 day ago",
                "Tadka is everything. Don’t skip the curry leaves."
            ),
            comment(
                "Sofia R.",
                "Buenos Aires",
                5,
                "1 week ago",
                "Made it with light coconut milk, still creamy."
            ),
        ],
        sections: [
            section(
                "Dal",
                [
                    [250, "g", "Red lentils", "rinsed"],
                    [1000, "ml", "Water"],
                    [1, "tsp", "Turmeric"],
                    [400, "ml", "Coconut milk"],
                ],
                [
                    "Simmer lentils, water and turmeric for 20 minutes until soft.",
                    "Stir in the coconut milk and season.",
                ]
            ),
            section(
                "Tadka",
                [
                    [2, "tbsp", "Ghee or oil"],
                    [1, "tsp", "Cumin seeds"],
                    [1, "tsp", "Mustard seeds"],
                    [8, "", "Curry leaves"],
                    [2, "", "Dried red chillies"],
                ],
                [
                    "Heat the ghee until shimmering, add the seeds until they pop.",
                    "Add curry leaves and chillies, then pour over the dal.",
                ]
            ),
        ],
    },
    {
        id: "r6",
        name: "Pão de queijo",
        author: "Lucas Mendes",
        place: "São Paulo",
        region: "Latin America",
        mine: false,
        visibility: "public",
        cuisine: "Brazilian",
        minutes: 45,
        kcal: 95,
        protein: 3,
        carbs: 12,
        fat: 4,
        fibre: 0,
        servings: 20,
        icon: "cookie",
        hue: "am",
        tags: ["Vegetarian"],
        rating: 4.6,
        ratingCount: 640,
        saves: 4800,
        comments: [
            comment(
                "Julia F.",
                "Porto",
                5,
                "5 days ago",
                "Mix half sour tapioca for the real stretch."
            ),
        ],
        sections: [
            section(
                "Dough",
                [
                    [250, "g", "Tapioca flour"],
                    [120, "ml", "Milk"],
                    [60, "ml", "Olive oil"],
                    [1, "", "Egg"],
                    [100, "g", "Parmesan", "finely grated"],
                ],
                [
                    "Boil milk, oil and a pinch of salt; pour over the tapioca and mix.",
                    "Beat in the egg and cheese, then roll into small balls.",
                    "Bake at 200°C for 20 minutes until puffed.",
                ]
            ),
        ],
    },
    {
        id: "r8",
        name: "Gazpacho",
        author: "Marta Gil",
        place: "Sevilla",
        region: "Mediterranean",
        mine: false,
        visibility: "public",
        cuisine: "Spanish",
        minutes: 15,
        kcal: 180,
        protein: 4,
        carbs: 14,
        fat: 13,
        fibre: 4,
        servings: 4,
        icon: "salad",
        hue: "ro",
        tags: ["Vegan", "Vegetarian"],
        rating: 4.5,
        ratingCount: 870,
        saves: 3900,
        comments: [
            comment(
                "Pedro L.",
                "Madrid",
                4,
                "3 weeks ago",
                "Soak a slice of stale bread in it before blending."
            ),
        ],
        sections: [
            section(
                "Soup",
                [
                    [1000, "g", "Ripe tomatoes"],
                    [1, "", "Cucumber"],
                    [1, "", "Green pepper"],
                    [1, "", "Garlic clove"],
                    [60, "ml", "Olive oil"],
                    [2, "tbsp", "Sherry vinegar"],
                ],
                [
                    "Blend everything until very smooth.",
                    "Chill for 2 hours and season before serving.",
                ]
            ),
        ],
    },
    {
        id: "c1",
        name: "Bibimbap",
        author: "Ji-woo Park",
        place: "Seoul",
        region: "Asia",
        mine: false,
        visibility: "public",
        cuisine: "Korean",
        minutes: 35,
        kcal: 560,
        protein: 28,
        carbs: 68,
        fat: 18,
        fibre: 7,
        servings: 2,
        icon: "soup",
        hue: "ro",
        tags: ["High protein"],
        rating: 4.8,
        ratingCount: 3200,
        saves: 18400,
        featured: true,
        sections: [
            section(
                "Gochujang sauce",
                [
                    [2, "tbsp", "Gochujang"],
                    [1, "tbsp", "Sesame oil"],
                    [1, "tsp", "Honey"],
                    [1, "tsp", "Rice vinegar"],
                ],
                ["Whisk the sauce together."]
            ),
            section(
                "Bowl",
                [
                    [200, "g", "Short-grain rice", "dry weight"],
                    [200, "g", "Beef mince"],
                    [150, "g", "Spinach"],
                    [1, "", "Carrot", "julienned"],
                    [100, "g", "Bean sprouts"],
                    [2, "", "Eggs"],
                ],
                [
                    "Cook the rice. Stir-fry the beef until browned.",
                    "Blanch spinach and sprouts for 1 minute; sauté the carrot.",
                    "Fry the eggs sunny side up and build the bowls.",
                ]
            ),
        ],
    },
    {
        id: "c2",
        name: "Chicken tinga tacos",
        author: "Valeria Ruiz",
        place: "Mexico City",
        region: "Latin America",
        mine: false,
        visibility: "public",
        cuisine: "Mexican",
        minutes: 30,
        kcal: 510,
        protein: 36,
        carbs: 44,
        fat: 19,
        fibre: 6,
        servings: 4,
        icon: "sandwich",
        hue: "am",
        tags: ["High protein"],
        rating: 4.7,
        ratingCount: 1900,
        saves: 9600,
        sections: [
            section(
                "Tinga",
                [
                    [500, "g", "Chicken breast"],
                    [400, "g", "Tomatoes"],
                    [2, "", "Chipotles in adobo"],
                    [1, "", "Onion", "sliced"],
                ],
                [
                    "Poach the chicken for 15 minutes, then shred.",
                    "Blend tomatoes and chipotles; simmer with the onion and chicken for 10 minutes.",
                ]
            ),
            section(
                "To serve",
                [
                    [12, "", "Corn tortillas"],
                    [1, "", "Avocado"],
                    [60, "g", "Queso fresco"],
                ],
                ["Warm tortillas and top with tinga, avocado and queso."]
            ),
        ],
    },
    {
        id: "c3",
        name: "Pad krapow gai",
        author: "Niran S.",
        place: "Bangkok",
        region: "Asia",
        mine: false,
        visibility: "public",
        cuisine: "Thai",
        minutes: 15,
        kcal: 590,
        protein: 34,
        carbs: 62,
        fat: 21,
        fibre: 3,
        servings: 2,
        icon: "flame",
        hue: "ro",
        tags: ["High protein"],
        rating: 4.9,
        ratingCount: 4100,
        saves: 22100,
        sections: [
            section(
                "Stir-fry",
                [
                    [300, "g", "Chicken thigh", "minced"],
                    [4, "", "Garlic cloves"],
                    [3, "", "Bird’s eye chillies"],
                    [1, "tbsp", "Oyster sauce"],
                    [1, "tbsp", "Fish sauce"],
                    [30, "g", "Holy basil"],
                ],
                [
                    "Pound garlic and chillies; fry for 30 seconds.",
                    "Add chicken and sauces; cook 4 minutes, then wilt in the basil.",
                ]
            ),
            section(
                "To serve",
                [
                    [2, "", "Eggs", "fried crispy"],
                    [300, "g", "Jasmine rice", "cooked"],
                ],
                ["Serve over rice with a crispy fried egg."]
            ),
        ],
    },
    {
        id: "c4",
        name: "Moroccan chickpea tagine",
        author: "Youssef A.",
        place: "Marrakesh",
        region: "Africa & Middle East",
        mine: false,
        visibility: "public",
        cuisine: "Moroccan",
        minutes: 50,
        kcal: 430,
        protein: 15,
        carbs: 62,
        fat: 12,
        fibre: 14,
        servings: 4,
        icon: "cooking-pot",
        hue: "am",
        tags: ["Vegan", "Vegetarian"],
        rating: 4.6,
        ratingCount: 720,
        saves: 5300,
        sections: [
            section(
                "Tagine",
                [
                    [2, "cans", "Chickpeas"],
                    [1, "", "Sweet potato", "cubed"],
                    [400, "g", "Chopped tomatoes"],
                    [2, "tsp", "Ras el hanout"],
                    [60, "g", "Dried apricots"],
                    [500, "ml", "Vegetable stock"],
                ],
                [
                    "Soften onion with the spice, add everything else.",
                    "Simmer covered for 35 minutes.",
                ]
            ),
        ],
    },
    {
        id: "c5",
        name: "Lemon chicken orzo",
        author: "Eleni K.",
        place: "Athens",
        region: "Mediterranean",
        mine: false,
        visibility: "public",
        cuisine: "Greek",
        minutes: 30,
        kcal: 540,
        protein: 39,
        carbs: 52,
        fat: 17,
        fibre: 3,
        servings: 4,
        icon: "citrus",
        hue: "ac",
        tags: ["High protein"],
        rating: 4.7,
        ratingCount: 1300,
        saves: 8800,
        sections: [
            section(
                "One pot",
                [
                    [500, "g", "Chicken thighs"],
                    [250, "g", "Orzo"],
                    [750, "ml", "Chicken stock"],
                    [1, "", "Lemon", "zest and juice"],
                    [100, "g", "Spinach"],
                    [60, "g", "Feta"],
                ],
                [
                    "Brown the chicken, then remove.",
                    "Toast orzo, add stock and lemon, return chicken and simmer 12 minutes.",
                    "Stir in spinach and top with feta.",
                ]
            ),
        ],
    },
    {
        id: "c6",
        name: "Classic ceviche",
        author: "Mateo Quispe",
        place: "Lima",
        region: "Latin America",
        mine: false,
        visibility: "public",
        cuisine: "Peruvian",
        minutes: 25,
        kcal: 240,
        protein: 30,
        carbs: 14,
        fat: 5,
        fibre: 3,
        servings: 4,
        icon: "fish",
        hue: "bl",
        tags: ["High protein"],
        rating: 4.8,
        ratingCount: 980,
        saves: 6100,
        sections: [
            section(
                "Ceviche",
                [
                    [500, "g", "Sea bass", "very fresh, diced"],
                    [8, "", "Limes", "juiced"],
                    [1, "", "Red onion", "thinly sliced"],
                    [1, "", "Ají limo", "minced"],
                    [15, "g", "Coriander"],
                ],
                [
                    "Toss fish with salt, then pour over lime juice.",
                    "Rest 3 minutes, add onion, chilli and coriander.",
                ]
            ),
        ],
    },
    {
        id: "c7",
        name: "Jollof rice",
        author: "Adaeze O.",
        place: "Lagos",
        region: "Africa & Middle East",
        mine: false,
        visibility: "public",
        cuisine: "Nigerian",
        minutes: 60,
        kcal: 480,
        protein: 9,
        carbs: 84,
        fat: 11,
        fibre: 4,
        servings: 6,
        icon: "wheat",
        hue: "ro",
        tags: ["Vegan", "Vegetarian"],
        rating: 4.9,
        ratingCount: 2600,
        saves: 14200,
        sections: [
            section(
                "Base",
                [
                    [3, "", "Red peppers"],
                    [400, "g", "Tomatoes"],
                    [1, "", "Scotch bonnet"],
                    [2, "tbsp", "Tomato paste"],
                ],
                [
                    "Blend peppers, tomatoes and scotch bonnet; fry with the paste for 15 minutes.",
                ]
            ),
            section(
                "Rice",
                [
                    [500, "g", "Long-grain rice", "washed"],
                    [600, "ml", "Stock"],
                    [2, "", "Bay leaves"],
                ],
                [
                    "Add rice and stock, cover tightly and cook on low for 30 minutes.",
                ]
            ),
        ],
    },
];

export function seedRecipes(): Recipe[] {
    return SEEDS.map((seed) => ({
        ...seed,
        rating: seed.rating ?? null,
        ratingCount: seed.ratingCount ?? 0,
        saves: seed.saves ?? 0,
        remixes: seed.remixes ?? [],
        comments: seed.comments ?? [],
        sections: structuredClone(seed.sections),
    }));
}

/** How many recipes each community cook has published. */
export const COOK_RECIPE_COUNTS: Record<string, number> = {
    "Ji-woo Park": 42,
    "Valeria Ruiz": 31,
    "Niran S.": 58,
    "Youssef A.": 17,
    "Eleni K.": 26,
    "Mateo Quispe": 12,
    "Adaeze O.": 39,
    "Aiko Tan": 64,
    "Priya Raman": 88,
    "Lucas Mendes": 21,
    "Marta Gil": 15,
};

/** An ingredient the importer pulled off the page, plus the Alimenta food it matched. */
export type ParsedIngredient = Ingredient & { match: string | null };

export type ParsedRecipe = Omit<
    Recipe,
    | "id"
    | "author"
    | "mine"
    | "visibility"
    | "sections"
    | "remixes"
    | "comments"
    | "rating"
    | "ratingCount"
    | "saves"
> & {
    sections: {
        name: string;
        ingredients: ParsedIngredient[];
        steps: string[];
    }[];
};

const parsedRow = (
    quantity: number | null,
    unit: string,
    name: string,
    note: string,
    match: string | null
): ParsedIngredient => ({ quantity, unit, name, note, match });

/** What "Convert" produces for any pasted link, until the importer is real. */
export const PARSED_IMPORT: ParsedRecipe = {
    name: "Crispy chickpea tacos",
    minutes: 25,
    kcal: 480,
    protein: 17,
    carbs: 61,
    fat: 19,
    fibre: 12,
    servings: 4,
    icon: "sandwich",
    hue: "am",
    cuisine: "Mexican",
    tags: ["Vegetarian"],
    sections: [
        {
            name: "Chickpeas",
            ingredients: [
                parsedRow(
                    2,
                    "cans",
                    "Chickpeas",
                    "drained",
                    "Chickpeas, canned"
                ),
                parsedRow(1, "tbsp", "Smoked paprika", "", "Paprika, smoked"),
                parsedRow(2, "tbsp", "Olive oil", "", "Olive oil"),
            ],
            steps: [
                "Toss chickpeas with paprika and oil; roast at 220°C for 20 minutes.",
            ],
        },
        {
            name: "Lime crema",
            ingredients: [
                parsedRow(150, "g", "Sour cream", "", "Sour cream"),
                parsedRow(1, "", "Lime", "juiced", "Lime, raw"),
                parsedRow(1, "tsp", "Tajín", "", null),
            ],
            steps: ["Stir sour cream, lime and Tajín together."],
        },
        {
            name: "To serve",
            ingredients: [
                parsedRow(8, "", "Corn tortillas", "small", "Corn tortilla"),
                parsedRow(0.25, "", "Red cabbage", "shredded", "Red cabbage"),
                parsedRow(1, "", "Avocado", "sliced", "Avocado"),
            ],
            steps: [
                "Warm tortillas, fill with chickpeas, cabbage and avocado, drizzle with crema.",
            ],
        },
    ],
};

/** The link the empty import sheet offers to try. */
export const EXAMPLE_IMPORT_URL =
    "https://www.cookingwithrosa.com/crispy-chickpea-tacos";

let nextId = 0;
export const newRecipeId = (prefix = "n") =>
    `${prefix}${Date.now()}${nextId++}`;

export const emptyIngredient = (): Ingredient => ({
    quantity: null,
    unit: "",
    name: "",
    note: "",
});

/** A blank recipe opened straight in edit mode by "Write". */
export function blankRecipe(id: string): Recipe {
    return {
        id,
        name: "",
        author: "You",
        mine: true,
        visibility: "private",
        cuisine: "Home cooking",
        minutes: 20,
        kcal: null,
        protein: null,
        carbs: null,
        fat: null,
        fibre: null,
        servings: 2,
        icon: "chef-hat",
        hue: "ac",
        tags: [],
        rating: null,
        ratingCount: 0,
        saves: 0,
        draft: true,
        remixes: [],
        comments: [],
        sections: [
            {
                name: "Ingredients",
                ingredients: [emptyIngredient(), emptyIngredient()],
                steps: [""],
            },
        ],
    };
}
