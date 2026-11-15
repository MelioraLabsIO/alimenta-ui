"use client";

import {
    Box,
    Button,
    Group,
    Paper,
    Stack,
    Text,
    UnstyledButton,
} from "@mantine/core";
import {
    Bookmark,
    ChefHat,
    Clock,
    Flame,
    Globe,
    Lock,
    Share2,
    type LucideIcon,
} from "lucide-react";
import type {
    Recipe,
    RecipeHue,
    RecipeScope,
} from "@/core/types/models/recipe";
import {
    RECIPE_FILTERS,
    RECIPE_ICONS,
    VISIBILITY_META,
    authorLine,
    hueColor,
    hueTile,
} from "./recipe-meta";
import type { RecipesState } from "./useRecipes";

/** How each shelf is headed: `hue: null` is the neutral `--sf2` tile. */
const COLLECTIONS: Record<
    RecipeScope,
    { label: string; icon: LucideIcon; hue: RecipeHue | null }
> = {
    community: { label: "Discover", icon: Globe, hue: "ro" },
    mine: { label: "My recipes", icon: ChefHat, hue: "ac" },
    private: { label: "Private", icon: Lock, hue: null },
    sharedByMe: { label: "Shared by me", icon: Share2, hue: "bl" },
    saved: { label: "Saved", icon: Bookmark, hue: "am" },
};

const SUB_SCOPES: { scope: RecipeScope; label: string }[] = [
    { scope: "mine", label: "All mine" },
    { scope: "private", label: "Private" },
    { scope: "sharedByMe", label: "Shared" },
];

/** A round filter chip: `--bd2` outline, inverted (`--tx` on `--sf`) when selected. */
export function PillChip({
    selected,
    onClick,
    children,
}: {
    selected: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <UnstyledButton
            onClick={onClick}
            aria-pressed={selected}
            h={32}
            px="md"
            fz="xs"
            fw={600}
            bg={selected ? "var(--tx)" : "transparent"}
            c={selected ? "var(--sf)" : "var(--tx)"}
            style={{
                borderRadius: "var(--mantine-radius-pill)",
                border: `1px solid ${selected ? "var(--tx)" : "var(--bd2)"}`,
                whiteSpace: "nowrap",
                transition:
                    "background-color var(--motion-fast), color var(--motion-fast)",
            }}
        >
            {children}
        </UnstyledButton>
    );
}

function subtitle(recipes: RecipesState) {
    const { query, queryIsUrl, results, filter } = recipes;
    const n = results.length;
    let text: string;
    if (queryIsUrl) {
        text = "Paste detected — convert it from the search bar";
    } else if (query.trim()) {
        text = `${n} result${n === 1 ? "" : "s"} for “${query.trim()}”`;
    } else {
        text = `${n} recipe${n === 1 ? "" : "s"}`;
    }
    return filter ? `${text} · ${filter}` : text;
}

function emptyText(recipes: RecipesState) {
    if (recipes.scope === "saved") {
        return "Nothing saved yet. Tap Save on any community recipe.";
    }
    return recipes.query.trim()
        ? "No recipes match your search."
        : "No recipes here yet.";
}

/**
 * The library grid for every shelf but Discover: collection header, the
 * private/shared sub-scopes on the "mine" tab, quick filters, and the cards.
 */
export function RecipeGrid({ recipes }: { recipes: RecipesState }) {
    const { scope, counts, filter, results } = recipes;
    const collection = COLLECTIONS[scope];
    const CollectionIcon = collection.icon;

    return (
        <Paper
            radius="xxl"
            p="xl"
            miw={0}
            style={{ flex: "1 1 0", minHeight: 640 }}
        >
            <Stack gap="lg">
                <Group gap="md" wrap="wrap">
                    <Box
                        w={48}
                        h={48}
                        bg={
                            collection.hue
                                ? hueTile(collection.hue)
                                : "var(--sf2)"
                        }
                        c={
                            collection.hue
                                ? hueColor(collection.hue)
                                : "var(--tx2)"
                        }
                        style={{
                            borderRadius: "var(--mantine-radius-lg)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <CollectionIcon size={22} />
                    </Box>
                    <Box miw={180} style={{ flex: 1 }}>
                        <Text fz="xxl" fw={700} lts="var(--ls-tight)">
                            {collection.label}
                        </Text>
                        <Text fz="sm" c="var(--tx3)">
                            {subtitle(recipes)}
                        </Text>
                    </Box>
                </Group>

                {recipes.onMineTab && (
                    <Group gap="xs" wrap="wrap">
                        {SUB_SCOPES.map((o) => {
                            const selected = scope === o.scope;
                            return (
                                <UnstyledButton
                                    key={o.scope}
                                    onClick={() => recipes.setScope(o.scope)}
                                    aria-pressed={selected}
                                    h={32}
                                    px="md"
                                    fz="xs"
                                    fw={700}
                                    bg={selected ? "var(--acs)" : "transparent"}
                                    c={selected ? "var(--ac)" : "var(--tx)"}
                                    style={{
                                        borderRadius:
                                            "var(--mantine-radius-sm)",
                                        border: `1px solid ${
                                            selected
                                                ? "var(--ac)"
                                                : "var(--bd2)"
                                        }`,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "var(--mantine-spacing-xs)",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {o.label}
                                    <Text
                                        component="span"
                                        fz="xs"
                                        fw={700}
                                        style={{ opacity: 0.6 }}
                                    >
                                        {counts[o.scope]}
                                    </Text>
                                </UnstyledButton>
                            );
                        })}
                    </Group>
                )}

                <Group gap="xs" wrap="wrap">
                    {RECIPE_FILTERS.map((f) => (
                        <PillChip
                            key={f}
                            selected={filter === f}
                            onClick={() => recipes.toggleFilter(f)}
                        >
                            {f}
                        </PillChip>
                    ))}
                </Group>

                {results.length > 0 && (
                    <Box
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fill, minmax(210px, 1fr))",
                            gap: "var(--mantine-spacing-md)",
                        }}
                    >
                        {results.map((r) => (
                            <RecipeCard
                                key={r.id}
                                recipe={r}
                                onOpen={() => recipes.openRecipe(r.id)}
                            />
                        ))}
                    </Box>
                )}

                {results.length === 0 && (
                    <Stack
                        align="center"
                        gap="md"
                        py={48}
                        px="xl"
                        style={{
                            borderRadius: "var(--mantine-radius-xl)",
                            border: "1px dashed var(--bd2)",
                            textAlign: "center",
                        }}
                    >
                        <Text c="var(--tx2)">{emptyText(recipes)}</Text>
                        <Group gap="sm">
                            <Button
                                h={38}
                                px="md"
                                radius="md"
                                fw={700}
                                onClick={recipes.writeNew}
                            >
                                Write a recipe
                            </Button>
                            <Button
                                variant="default"
                                h={38}
                                px="md"
                                radius="md"
                                onClick={recipes.openImport}
                            >
                                Import a link
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Stack>
        </Paper>
    );
}

function RecipeCard({
    recipe,
    onOpen,
}: {
    recipe: Recipe;
    onOpen: () => void;
}) {
    const Icon = RECIPE_ICONS[recipe.icon];
    const visibility = VISIBILITY_META[recipe.visibility];
    const VisibilityIcon = visibility.icon;

    return (
        <UnstyledButton
            onClick={onOpen}
            bg="var(--sf2)"
            c="var(--tx)"
            style={{
                textAlign: "left",
                borderRadius: "var(--mantine-radius-xl)",
                border: "1px solid var(--bd)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                transition:
                    "transform var(--motion-fast), border-color var(--motion-fast)",
            }}
        >
            <Box
                pos="relative"
                h={104}
                bg={hueTile(recipe.hue)}
                c={hueColor(recipe.hue)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Icon size={38} />
                {recipe.photo && (
                    <Box
                        component="img"
                        src={recipe.photo}
                        alt=""
                        pos="absolute"
                        inset={0}
                        w="100%"
                        h="100%"
                        style={{ objectFit: "cover" }}
                    />
                )}
                <Group
                    gap="xxs"
                    wrap="nowrap"
                    pos="absolute"
                    top="sm"
                    right="sm"
                    h={24}
                    px="sm"
                    bg="var(--glass)"
                    c="var(--tx2)"
                    fz="xxs"
                    fw={600}
                    style={{
                        borderRadius: "var(--mantine-radius-pill)",
                        backdropFilter: "blur(10px)",
                    }}
                >
                    <VisibilityIcon size={11} />
                    {visibility.short}
                </Group>
            </Box>
            <Stack gap="sm" px="md" pt="md" pb="md" w="100%">
                <Box>
                    <Text
                        fz="md"
                        fw={600}
                        lts="var(--ls-snug)"
                        lineClamp={2}
                        style={{ lineHeight: 1.25 }}
                    >
                        {recipe.name}
                    </Text>
                    <Text fz="xs" c="var(--tx3)" mt="xxs" truncate>
                        {authorLine(recipe)} · {recipe.cuisine}
                    </Text>
                </Box>
                <Group
                    gap="sm"
                    wrap="nowrap"
                    fz="xs"
                    c="var(--tx2)"
                    style={{ whiteSpace: "nowrap" }}
                >
                    <Group gap="xxs" wrap="nowrap">
                        <Clock size={12} />
                        {recipe.minutes} min
                    </Group>
                    <Group gap="xxs" wrap="nowrap">
                        <Flame size={12} />
                        {recipe.kcal ?? "—"}
                    </Group>
                    {recipe.rating != null && (
                        <Text component="span" fz="xs" fw={600} c="var(--am)">
                            ★ {recipe.rating.toFixed(1)}
                        </Text>
                    )}
                </Group>
            </Stack>
        </UnstyledButton>
    );
}
