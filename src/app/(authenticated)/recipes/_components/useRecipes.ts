"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    PARSED_IMPORT,
    blankRecipe,
    emptyIngredient,
    newRecipeId,
    seedRecipes,
} from "@/core/mock/recipes";
import type {
    Recipe,
    RecipeRegion,
    RecipeScope,
    RecipeVisibility,
    ShoppingItem,
    StepTimer,
} from "@/core/types/models/recipe";
import { toast } from "@/lib/notifications";
import {
    formatAmount,
    hostOf,
    isUrl,
    shareLink,
    timerSeconds,
} from "@/lib/recipe-format";
import {
    MINE_SCOPES,
    ingredientKey,
    inScope,
    isCommunity,
    matchesFilter,
    matchesQuery,
    stepKey,
} from "./recipe-meta";

export type RecipeView = "browse" | "recipe";

/** The four stages the link importer animates through before showing its result. */
export const IMPORT_STAGES = [
    "Fetching page",
    "Finding ingredients & steps",
    "Matching Alimenta foods",
    "Working out nutrition",
];
const IMPORT_STAGE_MS = 650;

const clampServings = (n: number) => Math.max(1, Math.min(99, n));

/**
 * Recipes page state, backed by mock data for now. Everything a server would
 * own (the library, saves, follows, ratings, the importer) goes through this
 * hook so swapping in TanStack Query later only touches this file.
 */
export function useRecipes() {
    const [recipes, setRecipes] = useState<Recipe[]>(seedRecipes);
    const [query, setQuery] = useState("");
    const [scope, setScope] = useState<RecipeScope>("community");
    const [filter, setFilter] = useState<string | null>(null);
    const [region, setRegion] = useState<RecipeRegion | null>(null);
    const [view, setView] = useState<RecipeView>("browse");
    const [selectedId, setSelectedId] = useState<string>("r3");

    const [servingsById, setServingsById] = useState<Record<string, number>>(
        {}
    );
    const [checked, setChecked] = useState<Record<string, boolean>>({});
    const [saved, setSaved] = useState<Record<string, boolean>>({});
    const [following, setFollowing] = useState<Record<string, boolean>>({});
    const [myRatings, setMyRatings] = useState<Record<string, number>>({});

    const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
    const [shopOpen, setShopOpen] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editSnapshot, setEditSnapshot] = useState<Recipe | null>(null);
    const [confirmDiscard, setConfirmDiscard] = useState(false);

    const [cookStep, setCookStep] = useState<number | null>(null);
    const [timers, setTimers] = useState<Record<string, StepTimer>>({});

    const [shareOpen, setShareOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const copyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

    const [importOpen, setImportOpen] = useState(false);
    const [importUrl, setImportUrl] = useState("");
    /** -1 idle, 0–3 the running stage, 4 finished. */
    const [importStage, setImportStage] = useState(-1);
    const [importVisibility, setImportVisibility] =
        useState<RecipeVisibility>("private");
    const importTimer = useRef<ReturnType<typeof setInterval>>(undefined);

    useEffect(
        () => () => {
            clearTimeout(copyTimer.current);
            clearInterval(importTimer.current);
        },
        []
    );

    /* ------------------------------------------------------- timers */

    const anyRunning = useMemo(
        () => Object.values(timers).some((t) => t.running),
        [timers]
    );

    useEffect(() => {
        if (!anyRunning) return;
        const tick = setInterval(() => {
            let finished = false;
            setTimers((prev) => {
                const next: Record<string, StepTimer> = {};
                for (const [key, t] of Object.entries(prev)) {
                    if (!t.running) {
                        next[key] = t;
                    } else if (t.left <= 1) {
                        next[key] = { left: 0, running: false, done: true };
                        finished = true;
                    } else {
                        next[key] = { ...t, left: t.left - 1 };
                    }
                }
                return next;
            });
            if (finished) toast.info("Timer done");
        }, 1000);
        return () => clearInterval(tick);
    }, [anyRunning]);

    const toggleTimer = useCallback((key: string, seconds: number) => {
        setTimers((prev) => {
            const t = prev[key];
            return {
                ...prev,
                [key]:
                    !t || t.done
                        ? { left: seconds, running: true, done: false }
                        : { ...t, running: !t.running },
            };
        });
    }, []);

    const resetTimer = useCallback((key: string) => {
        setTimers((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }, []);

    /* ------------------------------------------------------ derived */

    const queryIsUrl = isUrl(query);

    const selected = useMemo(
        () => recipes.find((r) => r.id === selectedId) ?? recipes[0],
        [recipes, selectedId]
    );
    const editing = editingId === selected.id && selected.mine;

    const counts = useMemo(
        () => ({
            mine: recipes.filter((r) => r.mine).length,
            private: recipes.filter((r) => r.mine && r.visibility === "private")
                .length,
            sharedByMe: recipes.filter(
                (r) => r.mine && r.visibility !== "private"
            ).length,
            saved: Object.values(saved).filter(Boolean).length,
            community: recipes.filter(isCommunity).length,
        }),
        [recipes, saved]
    );

    const results = useMemo(
        () =>
            recipes.filter(
                (r) =>
                    inScope(r, scope, saved) &&
                    matchesFilter(r, filter) &&
                    (queryIsUrl || matchesQuery(r, query))
            ),
        [recipes, scope, saved, filter, query, queryIsUrl]
    );

    /** Discover replaces the grid on the community shelf until the user searches. */
    const isDiscover =
        view === "browse" && scope === "community" && !query.trim();

    /** Servings being viewed; editing changes the recipe's own count instead. */
    const servings = editing
        ? selected.servings
        : (servingsById[selected.id] ?? selected.servings);
    const scale = servings / selected.servings;

    const steps = useMemo(
        () =>
            selected.sections.flatMap((section, sectionIndex) =>
                section.steps.map((text) => ({ text, sectionIndex }))
            ),
        [selected]
    );

    /* ------------------------------------------------- navigation */

    const openRecipe = useCallback((id: string) => {
        setSelectedId(id);
        setView("recipe");
        setEditingId(null);
        setShopOpen(false);
    }, []);

    const backToList = useCallback(() => {
        setView("browse");
        setEditingId(null);
        setEditSnapshot(null);
        setShopOpen(false);
        // An unnamed draft left behind is noise, not a recipe.
        setRecipes((prev) => prev.filter((r) => !(r.draft && !r.name.trim())));
    }, []);

    const changeScope = useCallback((next: RecipeScope) => {
        setScope(next);
        setView("browse");
        setEditingId(null);
    }, []);

    const changeQuery = useCallback((next: string) => {
        setQuery(next);
        setView("browse");
    }, []);

    /* ---------------------------------------------------- library */

    const updateRecipe = useCallback(
        (id: string, fn: (recipe: Recipe) => void) =>
            setRecipes((prev) =>
                prev.map((r) => {
                    if (r.id !== id) return r;
                    const copy = structuredClone(r);
                    fn(copy);
                    return copy;
                })
            ),
        []
    );

    const toggleSave = useCallback(
        (recipe: Recipe) => {
            const wasSaved = !!saved[recipe.id];
            setSaved((prev) => ({ ...prev, [recipe.id]: !wasSaved }));
            if (!wasSaved)
                toast.success(`${recipe.name} saved to your recipes`);
        },
        [saved]
    );

    const toggleFollow = useCallback(
        (name: string) =>
            setFollowing((prev) => ({ ...prev, [name]: !prev[name] })),
        []
    );

    const setServings = useCallback(
        (n: number) => {
            if (editing) {
                updateRecipe(selected.id, (r) => {
                    r.servings = clampServings(n);
                });
            } else {
                setServingsById((prev) => ({
                    ...prev,
                    [selected.id]: clampServings(n),
                }));
            }
        },
        [editing, selected.id, updateRecipe]
    );

    const setVisibility = useCallback(
        (visibility: RecipeVisibility) => {
            updateRecipe(selected.id, (r) => {
                r.visibility = visibility;
            });
            setCopied(false);
        },
        [selected.id, updateRecipe]
    );

    const rate = useCallback(
        (stars: number) =>
            setMyRatings((prev) => ({ ...prev, [selected.id]: stars })),
        [selected.id]
    );

    const postComment = useCallback(
        (text: string) => {
            const trimmed = text.trim();
            if (!trimmed) return;
            const stars = myRatings[selected.id] ?? null;
            updateRecipe(selected.id, (r) => {
                r.comments.unshift({
                    author: "You",
                    place: "",
                    stars,
                    when: "Just now",
                    text: trimmed,
                });
            });
        },
        [selected.id, myRatings, updateRecipe]
    );

    /* --------------------------------------------- check-offs & list */

    const toggleChecked = useCallback(
        (key: string) => setChecked((prev) => ({ ...prev, [key]: !prev[key] })),
        []
    );

    const toggleShoppingItem = useCallback(
        (item: Omit<ShoppingItem, "done">) =>
            setShoppingList((prev) =>
                prev.some((x) => x.key === item.key)
                    ? prev.filter((x) => x.key !== item.key)
                    : [...prev, { ...item, done: false }]
            ),
        []
    );

    const selectedShoppingItems = useMemo(
        () =>
            selected.sections.flatMap((section, si) =>
                section.ingredients.map((ing, ii) => ({
                    key: ingredientKey(selected.id, si, ii),
                    name: ing.name,
                    amount: formatAmount(
                        ing.quantity == null ? null : ing.quantity * scale,
                        ing.unit
                    ),
                    from: selected.name,
                }))
            ),
        [selected, scale]
    );

    const allInList =
        selectedShoppingItems.length > 0 &&
        selectedShoppingItems.every((item) =>
            shoppingList.some((x) => x.key === item.key)
        );

    const addAllToList = useCallback(() => {
        if (allInList) {
            setShopOpen(true);
            return;
        }
        setShoppingList((prev) => [
            ...prev,
            ...selectedShoppingItems
                .filter((item) => !prev.some((x) => x.key === item.key))
                .map((item) => ({ ...item, done: false })),
        ]);
        toast.success(
            `${selectedShoppingItems.length} items added to your list`
        );
    }, [allInList, selectedShoppingItems]);

    const toggleShoppingDone = useCallback(
        (key: string) =>
            setShoppingList((prev) =>
                prev.map((x) => (x.key === key ? { ...x, done: !x.done } : x))
            ),
        []
    );

    const removeShoppingItem = useCallback(
        (key: string) =>
            setShoppingList((prev) => prev.filter((x) => x.key !== key)),
        []
    );

    /* ----------------------------------------------------- editing */

    const startEdit = useCallback(() => {
        setEditingId(selected.id);
        setEditSnapshot(structuredClone(selected));
        setShopOpen(false);
    }, [selected]);

    const editSelected = useCallback(
        (fn: (recipe: Recipe) => void) => updateRecipe(selected.id, fn),
        [selected.id, updateRecipe]
    );

    const writeNew = useCallback(() => {
        const recipe = blankRecipe(newRecipeId("d"));
        setRecipes((prev) => [recipe, ...prev]);
        setSelectedId(recipe.id);
        setEditingId(recipe.id);
        setEditSnapshot(null);
        setView("recipe");
        setScope("mine");
        setShopOpen(false);
        setCookStep(null);
    }, []);

    const remix = useCallback(() => {
        const id = newRecipeId("x");
        const name = `${selected.name} — my remix`;
        const copy: Recipe = {
            ...structuredClone(selected),
            id,
            name,
            mine: true,
            author: "You",
            visibility: "private",
            draft: true,
            basedOn: {
                id: selected.id,
                name: selected.name,
                author: selected.mine ? "you" : selected.author,
            },
            comments: [],
            remixes: [],
            rating: null,
            ratingCount: 0,
            saves: 0,
            source: undefined,
        };
        setRecipes((prev) => [
            copy,
            ...prev.map((r) =>
                r.id === selected.id
                    ? { ...r, remixes: [...r.remixes, { name, author: "You" }] }
                    : r
            ),
        ]);
        setSelectedId(id);
        setEditingId(id);
        setScope("mine");
        setView("recipe");
        toast.success("Remix created — edit away");
    }, [selected]);

    const discardEdit = useCallback(() => {
        setConfirmDiscard(false);
        if (selected.draft) {
            setRecipes((prev) => prev.filter((r) => r.id !== selected.id));
            setView("browse");
        } else if (editSnapshot) {
            const snapshot = editSnapshot;
            setRecipes((prev) =>
                prev.map((r) => (r.id === snapshot.id ? snapshot : r))
            );
        }
        setEditingId(null);
        setEditSnapshot(null);
    }, [selected, editSnapshot]);

    const finishEdit = useCallback(() => {
        if (!selected.name.trim()) {
            toast.error("Give your recipe a name first");
            return;
        }
        const wasDraft = !!selected.draft;
        updateRecipe(selected.id, (r) => {
            r.draft = false;
            r.name = r.name.trim();
            if (!r.minutes) r.minutes = 20;
            r.sections = r.sections
                .map((s) => ({
                    ...s,
                    ingredients: s.ingredients.filter((i) => i.name.trim()),
                    steps: s.steps.filter((t) => t.trim()),
                }))
                .filter(
                    (s, _, all) =>
                        s.ingredients.length ||
                        s.steps.length ||
                        all.length === 1
                );
        });
        setEditingId(null);
        setEditSnapshot(null);
        toast.success(wasDraft ? "Recipe saved" : "Changes saved");
    }, [selected, updateRecipe]);

    const addSection = useCallback(
        () =>
            editSelected((r) => {
                r.sections.push({
                    name: "New section",
                    ingredients: [emptyIngredient()],
                    steps: [""],
                });
            }),
        [editSelected]
    );

    const setPhoto = useCallback(
        (file: File | null) => {
            if (!file || !/^image\//.test(file.type)) return;
            const reader = new FileReader();
            reader.onload = () =>
                updateRecipe(selected.id, (r) => {
                    r.photo = reader.result as string;
                });
            reader.readAsDataURL(file);
        },
        [selected.id, updateRecipe]
    );

    /* --------------------------------------------------- cook mode */

    const startCook = useCallback(() => {
        setCookStep(0);
        setEditingId(null);
        setShopOpen(false);
    }, []);

    const exitCook = useCallback(() => setCookStep(null), []);

    const cookIndex =
        cookStep == null
            ? 0
            : Math.min(cookStep, Math.max(0, steps.length - 1));

    const cookNext = useCallback(() => {
        if (cookIndex >= steps.length - 1) {
            setCookStep(null);
            toast.success("Enjoy! Rate it when you’re done");
        } else {
            setCookStep(cookIndex + 1);
        }
    }, [cookIndex, steps.length]);

    const cookPrev = useCallback(
        () => setCookStep(Math.max(0, cookIndex - 1)),
        [cookIndex]
    );

    /* ------------------------------------------------------ sharing */

    const link = shareLink(selected);

    const copyLink = useCallback(() => {
        // A private recipe can't be opened by a link, so copying unlocks it.
        if (selected.visibility === "private" && selected.mine) {
            setVisibility("link");
        }
        try {
            void navigator.clipboard?.writeText(link);
        } catch {
            // Clipboard access can be denied; the link is still shown on screen.
        }
        setCopied(true);
        clearTimeout(copyTimer.current);
        copyTimer.current = setTimeout(() => setCopied(false), 1600);
    }, [selected, link, setVisibility]);

    const openShare = useCallback(() => {
        setShareOpen(true);
        setCopied(false);
    }, []);

    /* ----------------------------------------------------- importing */

    const openImport = useCallback(() => {
        setImportOpen(true);
        setImportStage(-1);
    }, []);

    const closeImport = useCallback(() => {
        clearInterval(importTimer.current);
        setImportOpen(false);
        setImportStage(-1);
    }, []);

    const convert = useCallback((url: string) => {
        clearInterval(importTimer.current);
        setImportOpen(true);
        setImportUrl(url);
        setImportStage(0);
        // Simulated importer: one stage every 650ms until the result shows.
        importTimer.current = setInterval(() => {
            setImportStage((stage) => {
                if (stage >= IMPORT_STAGES.length) {
                    clearInterval(importTimer.current);
                    return stage;
                }
                return stage + 1;
            });
        }, IMPORT_STAGE_MS);
    }, []);

    const saveImport = useCallback(() => {
        const recipe: Recipe = {
            ...PARSED_IMPORT,
            id: newRecipeId("p"),
            author: "You",
            mine: true,
            visibility: importVisibility,
            source: hostOf(importUrl),
            rating: null,
            ratingCount: 0,
            saves: 0,
            remixes: [],
            comments: [],
            sections: PARSED_IMPORT.sections.map((s) => ({
                name: s.name,
                steps: [...s.steps],
                ingredients: s.ingredients.map(
                    ({ quantity, unit, name, note }) => ({
                        quantity,
                        unit,
                        name,
                        note,
                    })
                ),
            })),
        };
        setRecipes((prev) => [recipe, ...prev]);
        setSelectedId(recipe.id);
        setView("recipe");
        setScope("mine");
        setQuery("");
        closeImport();
        setImportUrl("");
        toast.success("Recipe saved");
    }, [importVisibility, importUrl, closeImport]);

    return {
        recipes,
        query,
        queryIsUrl,
        setQuery: changeQuery,
        clearQuery: () => setQuery(""),
        scope,
        setScope: changeScope,
        /** True for every "mine" shelf, so the tab stays lit on sub-scopes. */
        onMineTab: MINE_SCOPES.includes(scope),
        filter,
        toggleFilter: (f: string) => setFilter((cur) => (cur === f ? null : f)),
        region,
        setRegion,
        counts,
        results,
        view,
        isDiscover,
        openRecipe,
        backToList,

        selected,
        editing,
        servings,
        scale,
        setServings,
        steps,

        saved,
        toggleSave,
        following,
        toggleFollow,
        myRating: myRatings[selected.id] ?? 0,
        rate,
        postComment,
        setVisibility,

        checked,
        toggleChecked,
        shoppingList,
        shopOpen,
        toggleShopOpen: () => setShopOpen((o) => !o),
        closeShop: () => setShopOpen(false),
        clearShoppingList: () => setShoppingList([]),
        toggleShoppingItem,
        toggleShoppingDone,
        removeShoppingItem,
        allInList,
        addAllToList,

        startEdit,
        editSelected,
        writeNew,
        remix,
        confirmDiscard,
        askDiscard: () => setConfirmDiscard(true),
        cancelDiscard: () => setConfirmDiscard(false),
        discardEdit,
        finishEdit,
        addSection,
        setPhoto,
        removePhoto: () =>
            editSelected((r) => {
                r.photo = null;
            }),

        cooking: cookStep != null && steps.length > 0,
        cookIndex,
        setCookStep,
        startCook,
        exitCook,
        cookNext,
        cookPrev,
        timers,
        toggleTimer,
        resetTimer,
        /** Seconds a step's timer runs for, or 0 when the text names no duration. */
        stepSeconds: (text: string) => (editing ? 0 : timerSeconds(text)),
        stepKey: (n: number) => stepKey(selected.id, n),

        shareOpen,
        openShare,
        closeShare: () => setShareOpen(false),
        link,
        copied,
        copyLink,

        importOpen,
        importUrl,
        setImportUrl: (url: string) => {
            setImportUrl(url);
            setImportStage(-1);
        },
        importStage,
        importVisibility,
        setImportVisibility,
        openImport,
        closeImport,
        convert,
        saveImport,
    };
}

export type RecipesState = ReturnType<typeof useRecipes>;
