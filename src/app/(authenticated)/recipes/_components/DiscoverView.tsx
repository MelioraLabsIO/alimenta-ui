"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import {
    ActionIcon,
    Box,
    Button,
    Group,
    Paper,
    Stack,
    Text,
} from "@mantine/core";
import {
    ArrowRight,
    Bookmark,
    BookmarkCheck,
    BookmarkPlus,
    Clock,
    Sparkles,
} from "lucide-react";
import {
    RECIPE_REGIONS,
    type Recipe,
    type RecipeRegion,
} from "@/core/types/models/recipe";
import { formatCount } from "@/lib/recipe-format";
import { PillChip } from "./RecipeGrid";
import {
    AVATAR_HUES,
    RECIPE_ICONS,
    authorLine,
    discoverShelves,
    hueColor,
    hueTile,
} from "./recipe-meta";
import type { RecipesState } from "./useRecipes";

/** The black "ink" button: `--tx` fill with `--sf` text, overriding the filled variant's vars. */
const INK_BUTTON = {
    root: {
        "--button-bg": "var(--tx)",
        "--button-hover": "color-mix(in srgb, var(--tx) 86%, var(--sf))",
        "--button-color": "var(--sf)",
        "--button-bd": "0",
    } as CSSProperties,
};

/**
 * Card surfaces that hold their own buttons can't be `<button>`s themselves,
 * so they get a role plus Enter/Space handling instead.
 */
const pressable = (open: () => void) => ({
    role: "button" as const,
    tabIndex: 0,
    onClick: open,
    onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
        }
    },
});

function ShelfHeading({ title, sub }: { title: string; sub: string }) {
    return (
        <Group gap="sm" align="baseline" wrap="wrap">
            <Text fz="xl" fw={700} lts="var(--ls-snug)">
                {title}
            </Text>
            <Text fz="sm" c="var(--tx3)">
                {sub}
            </Text>
        </Group>
    );
}

function ShelfRow({ children }: { children: React.ReactNode }) {
    return (
        <Box
            style={{
                display: "flex",
                gap: "var(--mantine-spacing-md)",
                overflowX: "auto",
                padding: "2px 2px var(--mantine-spacing-sm)",
                scrollbarWidth: "thin",
                scrollbarColor: "var(--bd2) transparent",
            }}
        >
            {children}
        </Box>
    );
}

/**
 * The community front page: region picker, recipe of the week, trending and
 * quick shelves, and cooks to follow. Shown on the Discover tab until the
 * user types a search.
 */
export function DiscoverView({ recipes }: { recipes: RecipesState }) {
    const { region } = recipes;
    const { featured, trending, quick, cooks } = discoverShelves(
        recipes.recipes,
        region
    );
    const regionChips: { label: string; value: RecipeRegion | null }[] = [
        { label: "Everywhere", value: null },
        ...RECIPE_REGIONS.map((r) => ({ label: r, value: r })),
    ];

    return (
        <Stack gap="xl" miw={0} style={{ flex: "1 1 0" }}>
            <Group gap="sm" wrap="wrap">
                <Text fz="sm" c="var(--tx3)" mr="xxs">
                    {region
                        ? `Recipes shared by cooks in ${region}`
                        : "Recipes shared by cooks around the world"}
                </Text>
                <Box style={{ flex: 1 }} />
                {regionChips.map((c) => (
                    <PillChip
                        key={c.label}
                        selected={region === c.value}
                        onClick={() => recipes.setRegion(c.value)}
                    >
                        {c.label}
                    </PillChip>
                ))}
            </Group>

            {featured && <FeaturedCard recipe={featured} recipes={recipes} />}

            <Stack gap="md">
                <ShelfHeading
                    title="Trending this week"
                    sub="Most saved by the community"
                />
                <ShelfRow>
                    {trending.map((r) => (
                        <DiscoverCard key={r.id} recipe={r} recipes={recipes} />
                    ))}
                </ShelfRow>
            </Stack>

            {quick.length > 0 && (
                <Stack gap="md">
                    <ShelfHeading
                        title="Quick & high protein"
                        sub="Ready in 30 minutes or less"
                    />
                    <ShelfRow>
                        {quick.map((r) => (
                            <DiscoverCard
                                key={r.id}
                                recipe={r}
                                recipes={recipes}
                            />
                        ))}
                    </ShelfRow>
                </Stack>
            )}

            <Stack gap="md">
                <ShelfHeading
                    title="Cooks to follow"
                    sub="Their new recipes show up first here"
                />
                <Box
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fill, minmax(230px, 1fr))",
                        gap: "var(--mantine-spacing-sm)",
                    }}
                >
                    {cooks.map((cook, i) => {
                        const hue = AVATAR_HUES[i % AVATAR_HUES.length];
                        const following = !!recipes.following[cook.name];
                        return (
                            <Paper
                                key={cook.name}
                                radius="lg"
                                p="md"
                                shadow="none"
                            >
                                <Group gap="md" wrap="nowrap">
                                    <Box
                                        w={44}
                                        h={44}
                                        bg={hueTile(hue)}
                                        c={hueColor(hue)}
                                        fw={700}
                                        fz="lg"
                                        style={{
                                            borderRadius:
                                                "var(--mantine-radius-pill)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {cook.name.charAt(0)}
                                    </Box>
                                    <Box miw={0} style={{ flex: 1 }}>
                                        <Text fw={600} truncate>
                                            {cook.name}
                                        </Text>
                                        <Text fz="xs" c="var(--tx3)">
                                            {cook.place} · {cook.count} recipes
                                        </Text>
                                    </Box>
                                    <Button
                                        variant={
                                            following ? "default" : "filled"
                                        }
                                        h={30}
                                        px="md"
                                        radius="pill"
                                        fz="xs"
                                        fw={700}
                                        styles={
                                            following ? undefined : INK_BUTTON
                                        }
                                        onClick={() =>
                                            recipes.toggleFollow(cook.name)
                                        }
                                    >
                                        {following ? "Following" : "Follow"}
                                    </Button>
                                </Group>
                            </Paper>
                        );
                    })}
                </Box>
            </Stack>
        </Stack>
    );
}

function FeaturedCard({
    recipe,
    recipes,
}: {
    recipe: Recipe;
    recipes: RecipesState;
}) {
    const Icon = RECIPE_ICONS[recipe.icon];
    const isSaved = !!recipes.saved[recipe.id];
    const SaveIcon = isSaved ? BookmarkCheck : BookmarkPlus;
    const open = () => recipes.openRecipe(recipe.id);
    const facts = [
        `★ ${recipe.rating?.toFixed(1) ?? "–"}`,
        recipe.cuisine,
        `${recipe.minutes} min`,
        recipe.kcal != null ? `${recipe.kcal} kcal` : null,
        `${formatCount(recipe.ratingCount)} ratings`,
    ].filter(Boolean);

    return (
        <Paper
            {...pressable(open)}
            radius="xxl"
            p={0}
            style={{
                display: "flex",
                flexWrap: "wrap",
                overflow: "hidden",
                cursor: "pointer",
                minHeight: 280,
            }}
        >
            <Stack
                justify="center"
                gap="md"
                style={{
                    flex: "1 1 320px",
                    padding:
                        "var(--mantine-spacing-xxl) clamp(20px, 3vw, 40px)",
                }}
            >
                <Group
                    gap="xs"
                    wrap="nowrap"
                    h={26}
                    px="sm"
                    bg="var(--acs)"
                    c="var(--ac)"
                    fz="xxs"
                    fw={700}
                    lts="var(--ls-wide)"
                    tt="uppercase"
                    style={{
                        alignSelf: "flex-start",
                        borderRadius: "var(--mantine-radius-pill)",
                    }}
                >
                    <Sparkles size={12} />
                    Recipe of the week
                </Group>
                <Text
                    fw={700}
                    lts="var(--ls-tight)"
                    style={{
                        fontSize: "clamp(30px, 3.4vw, 44px)",
                        lineHeight: 1.02,
                    }}
                >
                    {recipe.name}
                </Text>
                <Text fz="md" c="var(--tx2)">
                    by {authorLine(recipe)}
                </Text>
                <Text fz="sm" c="var(--tx3)">
                    {facts.join(" · ")}
                </Text>
                <Group gap="sm" wrap="wrap" mt="xs">
                    <Button
                        h={44}
                        px="lg"
                        radius="md"
                        fw={700}
                        rightSection={<ArrowRight size={16} />}
                        styles={{
                            ...INK_BUTTON,
                            inner: { gap: "var(--mantine-spacing-sm)" },
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            open();
                        }}
                    >
                        View recipe
                    </Button>
                    <Button
                        variant="default"
                        h={44}
                        px="lg"
                        radius="md"
                        leftSection={<SaveIcon size={16} />}
                        styles={{ inner: { gap: "var(--mantine-spacing-sm)" } }}
                        onClick={(e) => {
                            e.stopPropagation();
                            recipes.toggleSave(recipe);
                        }}
                    >
                        {isSaved ? "Saved" : "Save"} ·{" "}
                        {formatCount(recipe.saves + (isSaved ? 1 : 0))}
                    </Button>
                </Group>
            </Stack>
            <Box
                pos="relative"
                c={hueColor(recipe.hue)}
                style={{
                    flex: "1 1 300px",
                    minHeight: 220,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `linear-gradient(135deg, ${hueTile(recipe.hue)}, transparent 85%), var(--sf2)`,
                }}
            >
                <Icon size={96} />
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
            </Box>
        </Paper>
    );
}

/** A 232px shelf card: tile with cuisine pill and save toggle, then name, author and stats. */
function DiscoverCard({
    recipe,
    recipes,
}: {
    recipe: Recipe;
    recipes: RecipesState;
}) {
    const Icon = RECIPE_ICONS[recipe.icon];
    const isSaved = !!recipes.saved[recipe.id];
    const saveLabel = isSaved ? "Remove from saved" : "Save recipe";

    return (
        <Paper
            {...pressable(() => recipes.openRecipe(recipe.id))}
            radius="xl"
            p={0}
            style={{
                flex: "0 0 232px",
                overflow: "hidden",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                transition:
                    "transform var(--motion-fast), border-color var(--motion-fast)",
            }}
        >
            <Box
                pos="relative"
                h={132}
                c={hueColor(recipe.hue)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `linear-gradient(135deg, ${hueTile(recipe.hue)}, transparent 80%), var(--sf2)`,
                }}
            >
                <Icon size={42} />
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
                <Box
                    pos="absolute"
                    top="sm"
                    left="sm"
                    h={24}
                    px="sm"
                    bg="var(--glass)"
                    c="var(--tx2)"
                    fz="xxs"
                    fw={600}
                    style={{
                        borderRadius: "var(--mantine-radius-pill)",
                        backdropFilter: "blur(10px)",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    {recipe.cuisine}
                </Box>
                <ActionIcon
                    pos="absolute"
                    top="sm"
                    right="sm"
                    size={32}
                    radius="sm"
                    variant={isSaved ? "filled" : "glass"}
                    aria-label={saveLabel}
                    title={saveLabel}
                    onClick={(e) => {
                        e.stopPropagation();
                        recipes.toggleSave(recipe);
                    }}
                >
                    {isSaved ? (
                        <BookmarkCheck size={15} />
                    ) : (
                        <BookmarkPlus size={15} />
                    )}
                </ActionIcon>
            </Box>
            <Stack gap="sm" px="md" pt="md" pb="md">
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
                        {authorLine(recipe)}
                    </Text>
                </Box>
                <Group
                    gap="sm"
                    wrap="nowrap"
                    fz="xs"
                    c="var(--tx2)"
                    style={{ whiteSpace: "nowrap" }}
                >
                    <Text component="span" fz="xs" fw={600} c="var(--am)">
                        ★ {recipe.rating?.toFixed(1) ?? "–"}
                    </Text>
                    <Group gap="xxs" wrap="nowrap">
                        <Clock size={12} />
                        {recipe.minutes} min
                    </Group>
                    <Group gap="xxs" wrap="nowrap" c="var(--tx3)">
                        <Bookmark size={12} />
                        {formatCount(recipe.saves)}
                    </Group>
                </Group>
            </Stack>
        </Paper>
    );
}
