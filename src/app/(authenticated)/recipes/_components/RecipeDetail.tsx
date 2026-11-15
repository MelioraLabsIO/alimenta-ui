"use client";

import { useState, type DragEvent, type ReactNode } from "react";
import {
    ActionIcon,
    Box,
    Button,
    FileButton,
    Flex,
    Group,
    Paper,
    Stack,
    Text,
    TextInput,
    UnstyledButton,
} from "@mantine/core";
import {
    BookmarkCheck,
    BookmarkPlus,
    Check,
    ChefHat,
    ChevronLeft,
    Copy,
    GitFork,
    ImagePlus,
    ImageUp,
    Link,
    Lock,
    Minus,
    Pencil,
    Plus,
    Share2,
    ShoppingBasket,
    Trash2,
} from "lucide-react";
import type { Recipe, RecipeScope } from "@/core/types/models/recipe";
import { IngredientSections } from "./IngredientSections";
import { MethodSteps } from "./MethodSteps";
import {
    AVATAR_HUES,
    RECIPE_ICONS,
    VISIBILITIES,
    VISIBILITY_META,
    fibreLabel,
    hueColor,
    hueTile,
    macroSlices,
    tint,
} from "./recipe-meta";
import { ShoppingListPopover } from "./ShoppingListPopover";
import type { RecipesState } from "./useRecipes";

const COLLECTION_LABEL: Record<RecipeScope, string> = {
    community: "Discover",
    mine: "My recipes",
    private: "Private",
    sharedByMe: "Shared by me",
    saved: "Saved",
};

const TOP_RADII = "var(--mantine-radius-xxl) var(--mantine-radius-xxl) 0 0";
const GLASS_BLUR = { backdropFilter: "blur(18px)" } as const;
const STARS = [1, 2, 3, 4, 5];

/**
 * The recipe document: header bar (view or edit), cover photo, title, time /
 * servings / nutrition, then the ingredient and method blocks, remixes and
 * the comments thread. Fields grow a dashed outline while editing.
 */
export function RecipeDetail({ recipes }: { recipes: RecipesState }) {
    const r = recipes.selected;
    const { editing } = recipes;

    return (
        <Paper
            radius="xxl"
            pos="relative"
            p={0}
            withBorder={false}
            shadow="none"
            style={{
                flex: "1 1 0",
                minWidth: 0,
                border: editing
                    ? "1.5px solid var(--ac)"
                    : "1px solid var(--bd)",
                boxShadow: editing
                    ? `0 0 0 5px ${tint("var(--ac)", 14)}, var(--sh)`
                    : "var(--sh)",
                transition: "border-color 200ms, box-shadow 200ms",
            }}
        >
            {editing ? (
                <EditBar recipes={recipes} />
            ) : (
                <ViewBar recipes={recipes} />
            )}

            <Stack
                gap="xxl"
                style={{ padding: "30px clamp(18px, 4vw, 44px) 40px" }}
            >
                <CoverPhoto recipes={recipes} />
                <TitleBlock recipes={recipes} />
                <StatsRow recipes={recipes} />
                <IngredientSections recipes={recipes} />
                <MethodSteps recipes={recipes} />
                {r.remixes.length > 0 && <RemixList recipe={r} />}
                <CommentsSection recipes={recipes} />
            </Stack>
        </Paper>
    );
}

/* ------------------------------------------------------------ header bars */

type BarButtonProps = {
    variant: "subtle" | "surface" | "default";
    icon: ReactNode;
    onClick: () => void;
    children: ReactNode;
    fw?: number;
};

/** The 32px pill every header-bar control is built from. */
function BarButton({
    variant,
    icon,
    onClick,
    children,
    fw = 600,
}: BarButtonProps) {
    return (
        <Button
            variant={variant}
            size="xs"
            h={32}
            radius="pill"
            fz="xs"
            fw={fw}
            onClick={onClick}
            leftSection={icon}
            styles={{ inner: { gap: "var(--mantine-spacing-xs)" } }}
        >
            {children}
        </Button>
    );
}

function EditBar({ recipes }: { recipes: RecipesState }) {
    const r = recipes.selected;
    const draft = !!r.draft;

    return (
        <Flex
            wrap="wrap"
            align="center"
            gap="sm"
            px="lg"
            py="md"
            pos="sticky"
            top={0}
            style={{
                zIndex: 15,
                borderRadius: TOP_RADII,
                background: "color-mix(in srgb, var(--ac) 14%, var(--sf))",
                borderBottom:
                    "1px solid color-mix(in srgb, var(--ac) 40%, transparent)",
                ...GLASS_BLUR,
            }}
        >
            <Group
                gap="xs"
                wrap="nowrap"
                h={30}
                px="md"
                bg="var(--ac)"
                c="var(--act)"
                fz="xs"
                fw={700}
                style={{
                    borderRadius: "var(--mantine-radius-pill)",
                    whiteSpace: "nowrap",
                }}
            >
                <Pencil size={13} />
                {draft ? "New recipe" : "Editing"}
            </Group>
            <Text fz="xs" c="var(--tx2)" miw={160} style={{ flex: 1 }}>
                {draft
                    ? "Fill it in like the finished page. Fields with a dashed outline are editable."
                    : "Dashed fields are editable. Nothing is saved until you press Done."}
            </Text>
            <Group gap="xxs" wrap="nowrap">
                {VISIBILITIES.map((v) => {
                    const meta = VISIBILITY_META[v];
                    const Icon = meta.icon;
                    const selected = r.visibility === v;
                    return (
                        <UnstyledButton
                            key={v}
                            title={meta.description}
                            onClick={() => recipes.setVisibility(v)}
                            h={30}
                            px={10}
                            fz="xs"
                            fw={600}
                            c={selected ? "var(--tx)" : "var(--tx2)"}
                            bg={selected ? "var(--sf)" : "transparent"}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                whiteSpace: "nowrap",
                                borderRadius: "var(--mantine-radius-pill)",
                                border: `1px solid ${selected ? "var(--ac)" : "var(--bd2)"}`,
                            }}
                        >
                            <Icon size={13} />
                            {meta.short}
                        </UnstyledButton>
                    );
                })}
            </Group>
            <Button
                variant="default"
                size="sm"
                h={34}
                radius="pill"
                fz="sm"
                onClick={recipes.askDiscard}
            >
                {draft ? "Discard" : "Cancel"}
            </Button>
            <Button
                variant="filled"
                size="sm"
                h={34}
                radius="pill"
                fz="sm"
                fw={700}
                onClick={recipes.finishEdit}
                leftSection={<Check size={14} />}
                styles={{ inner: { gap: "var(--mantine-spacing-xs)" } }}
            >
                {draft ? "Save recipe" : "Done"}
            </Button>
        </Flex>
    );
}

function ViewBar({ recipes }: { recipes: RecipesState }) {
    const r = recipes.selected;
    const vis = VISIBILITY_META[r.visibility];
    const VisIcon = vis.icon;
    const isSaved = !!recipes.saved[r.id];
    const shopCount = recipes.shoppingList.filter((x) => !x.done).length;

    return (
        <Flex
            wrap="wrap"
            align="center"
            gap="sm"
            px="lg"
            py="md"
            bg="var(--glass)"
            style={{
                borderRadius: TOP_RADII,
                borderBottom: "1px solid var(--bd)",
                ...GLASS_BLUR,
            }}
        >
            <Button
                variant="subtle"
                size="xs"
                h={32}
                radius="pill"
                fz="xs"
                fw={600}
                onClick={recipes.backToList}
                leftSection={<ChevronLeft size={15} />}
                styles={{
                    root: { paddingInlineStart: "var(--mantine-spacing-sm)" },
                    inner: { gap: "var(--mantine-spacing-xxs)" },
                }}
            >
                {COLLECTION_LABEL[recipes.scope]}
            </Button>
            <Group
                gap="xs"
                wrap="nowrap"
                h={32}
                px="md"
                bg="var(--sf2)"
                fz="xs"
                fw={600}
                style={{
                    borderRadius: "var(--mantine-radius-pill)",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                }}
            >
                <VisIcon size={13} />
                {vis.label}
            </Group>
            <BarButton
                variant="surface"
                onClick={recipes.copyLink}
                icon={recipes.copied ? <Check size={13} /> : <Copy size={13} />}
            >
                {recipes.copied ? "Copied" : "Copy link"}
            </BarButton>
            <BarButton
                variant="surface"
                onClick={recipes.openShare}
                icon={<Share2 size={13} />}
            >
                Share
            </BarButton>
            <Box style={{ flex: 1 }} />
            <BarButton
                variant="default"
                onClick={recipes.remix}
                icon={<GitFork size={13} />}
            >
                Remix
            </BarButton>
            {r.mine ? (
                <BarButton
                    variant="default"
                    onClick={recipes.startEdit}
                    icon={<Pencil size={13} />}
                    fw={700}
                >
                    Edit
                </BarButton>
            ) : (
                <BarButton
                    variant="default"
                    onClick={() => recipes.toggleSave(r)}
                    icon={
                        isSaved ? (
                            <BookmarkCheck size={13} />
                        ) : (
                            <BookmarkPlus size={13} />
                        )
                    }
                >
                    {isSaved ? "Saved" : "Save"}
                </BarButton>
            )}
            <ShoppingListPopover recipes={recipes}>
                <Button
                    variant="filled"
                    size="xs"
                    h={32}
                    radius="pill"
                    fz="xs"
                    fw={700}
                    onClick={recipes.toggleShopOpen}
                    leftSection={<ShoppingBasket size={13} />}
                    rightSection={
                        <Box
                            component="span"
                            miw={18}
                            h={18}
                            px={5}
                            bg="var(--ac)"
                            c="var(--act)"
                            fz="xxs"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "var(--mantine-radius-pill)",
                            }}
                        >
                            {shopCount}
                        </Box>
                    }
                    styles={{
                        root: {
                            background: "var(--tx)",
                            color: "var(--sf)",
                            boxShadow: "none",
                        },
                        inner: { gap: "var(--mantine-spacing-xs)" },
                    }}
                >
                    List
                </Button>
            </ShoppingListPopover>
        </Flex>
    );
}

/* ------------------------------------------------------------ cover photo */

type PhotoPillProps = {
    icon: ReactNode;
    children: ReactNode;
    onClick?: () => void;
    h?: number;
};

/** Glass pill floating over the bottom-right corner of the photo. */
function PhotoPill({ icon, children, onClick, h = 36 }: PhotoPillProps) {
    return (
        <Button
            variant="glass"
            size="sm"
            h={h}
            radius="pill"
            fz={h === 36 ? "sm" : "xs"}
            fw={600}
            c="var(--tx)"
            onClick={onClick}
            leftSection={icon}
            styles={{
                root: {
                    borderColor: "var(--bd2)",
                    backdropFilter: "blur(14px)",
                },
                inner: { gap: "var(--mantine-spacing-xs)" },
            }}
        >
            {children}
        </Button>
    );
}

function CoverPhoto({ recipes }: { recipes: RecipesState }) {
    const r = recipes.selected;
    const { editing } = recipes;
    const [dragging, setDragging] = useState(false);

    const onDragOver = (e: DragEvent<HTMLElement>) => {
        e.preventDefault();
        if (!dragging) setDragging(true);
    };
    const onDragLeave = () => setDragging(false);
    const onDrop = (e: DragEvent<HTMLElement>) => {
        e.preventDefault();
        setDragging(false);
        recipes.setPhoto(e.dataTransfer.files[0] ?? null);
    };

    if (r.photo) {
        return (
            <Box
                pos="relative"
                bg="var(--sf2)"
                h="clamp(220px, 32vw, 340px)"
                onDrop={editing ? onDrop : undefined}
                onDragOver={editing ? onDragOver : undefined}
                onDragLeave={editing ? onDragLeave : undefined}
                style={{
                    borderRadius: 22,
                    overflow: "hidden",
                    outline: dragging ? "2px dashed var(--ac)" : "none",
                    outlineOffset: 3,
                }}
            >
                <Box
                    component="img"
                    src={r.photo}
                    alt={r.name}
                    w="100%"
                    h="100%"
                    display="block"
                    style={{ objectFit: "cover" }}
                />
                {editing && (
                    <Group gap="sm" pos="absolute" right={12} bottom={12}>
                        <FileButton
                            accept="image/*"
                            onChange={recipes.setPhoto}
                        >
                            {(props) => (
                                <PhotoPill
                                    icon={<ImageUp size={14} />}
                                    {...props}
                                >
                                    Replace
                                </PhotoPill>
                            )}
                        </FileButton>
                        <PhotoPill
                            icon={<Trash2 size={14} />}
                            onClick={recipes.removePhoto}
                        >
                            Remove
                        </PhotoPill>
                    </Group>
                )}
            </Box>
        );
    }

    if (editing) {
        return (
            <FileButton accept="image/*" onChange={recipes.setPhoto}>
                {(props) => (
                    <UnstyledButton
                        {...props}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        w="100%"
                        h={220}
                        p="xl"
                        ta="center"
                        bg={
                            dragging
                                ? "color-mix(in srgb, var(--ac) 22%, var(--sf))"
                                : "var(--acs)"
                        }
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "var(--mantine-spacing-sm)",
                            borderRadius: 22,
                            border: "1.5px dashed var(--ac)",
                            transition: "background var(--motion-fast)",
                        }}
                    >
                        <Box
                            w={52}
                            h={52}
                            bg="var(--sf)"
                            c="var(--ac)"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "var(--mantine-radius-lg)",
                            }}
                        >
                            <ImagePlus size={24} />
                        </Box>
                        <Text fz="lg" fw={700}>
                            Add a cover photo
                        </Text>
                        <Text fz="sm" c="var(--tx2)">
                            Drag an image here, or click to browse. A good photo
                            helps people find and trust your recipe.
                        </Text>
                    </UnstyledButton>
                )}
            </FileButton>
        );
    }

    const Icon = RECIPE_ICONS[r.icon];
    return (
        <Box
            pos="relative"
            h={150}
            c={hueColor(r.hue)}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 22,
                overflow: "hidden",
                background: `linear-gradient(135deg, ${hueTile(r.hue)}, transparent 75%), var(--sf2)`,
            }}
        >
            <Icon size={52} />
            {r.mine && (
                <Box pos="absolute" right={12} bottom={12}>
                    <FileButton accept="image/*" onChange={recipes.setPhoto}>
                        {(props) => (
                            <PhotoPill
                                icon={<ImagePlus size={13} />}
                                h={34}
                                {...props}
                            >
                                Add photo
                            </PhotoPill>
                        )}
                    </FileButton>
                </Box>
            )}
        </Box>
    );
}

/* ------------------------------------------------------------ title block */

function TitleBlock({ recipes }: { recipes: RecipesState }) {
    const r = recipes.selected;
    const { editing } = recipes;
    const basedOn = r.basedOn;
    const author = r.mine
        ? "You"
        : [r.author, r.place].filter(Boolean).join(", ");
    const remixCount = r.remixes.length;

    return (
        <Stack gap="sm">
            {basedOn && (
                <Button
                    variant="surface"
                    size="xs"
                    h={28}
                    radius="pill"
                    fz="xs"
                    fw={600}
                    c="var(--tx2)"
                    leftSection={<GitFork size={13} />}
                    onClick={
                        basedOn.id
                            ? () => recipes.openRecipe(basedOn.id as string)
                            : undefined
                    }
                    style={{
                        alignSelf: "flex-start",
                        cursor: basedOn.id ? "pointer" : "default",
                    }}
                    styles={{ inner: { gap: "var(--mantine-spacing-xs)" } }}
                >
                    Remix of {basedOn.name} by {basedOn.author}
                </Button>
            )}
            <Text
                fz="xs"
                c="var(--tx3)"
                ff="var(--font-mono)"
                tt="uppercase"
                lts="var(--ls-wide)"
            >
                {r.cuisine}
            </Text>
            {editing ? (
                <TextInput
                    variant="unstyled"
                    value={r.name}
                    placeholder="Name your recipe"
                    onChange={(e) => {
                        const value = e.currentTarget.value;
                        recipes.editSelected((x) => {
                            x.name = value;
                        });
                    }}
                    styles={{
                        input: {
                            height: "auto",
                            minHeight: 0,
                            fontSize: 42,
                            fontWeight: 700,
                            letterSpacing: "var(--ls-tight)",
                            lineHeight: 1.1,
                            padding: "4px 10px",
                            marginLeft: -10,
                            width: "calc(100% + 10px)",
                            borderRadius: "var(--mantine-radius-md)",
                            border: "1px dashed var(--ac)",
                            background: "var(--acs)",
                            color: "var(--tx)",
                        },
                    }}
                />
            ) : (
                <Text
                    fz={42}
                    fw={700}
                    lts="var(--ls-tight)"
                    lh={1.05}
                    style={{ textWrap: "balance" }}
                >
                    {r.name}
                </Text>
            )}
            <Group gap="md" wrap="wrap" fz="sm" c="var(--tx2)">
                <Text fz="sm" c="var(--tx2)">
                    By {author}
                </Text>
                {r.rating != null && (
                    <Group gap="xs" wrap="nowrap">
                        <Group gap={1} wrap="nowrap" fz="md">
                            {STARS.map((n) => (
                                <Text
                                    key={n}
                                    component="span"
                                    fz="md"
                                    c={
                                        n <= Math.round(r.rating ?? 0)
                                            ? "var(--am)"
                                            : "var(--bd2)"
                                    }
                                >
                                    ★
                                </Text>
                            ))}
                        </Group>
                        <Text fz="sm" fw={600} c="var(--tx)">
                            {r.rating}
                        </Text>
                        <Text fz="sm" c="var(--tx3)">
                            {r.ratingCount.toLocaleString("en")} ratings
                        </Text>
                    </Group>
                )}
                {remixCount > 0 && (
                    <Group gap="xxs" wrap="nowrap" c="var(--tx3)">
                        <GitFork size={13} />
                        <Text fz="sm" c="var(--tx3)">
                            {remixCount}{" "}
                            {remixCount === 1 ? "remix" : "remixes"}
                        </Text>
                    </Group>
                )}
                {r.source && (
                    <Group gap="xxs" wrap="nowrap" c="var(--tx3)">
                        <Link size={13} />
                        <Text fz="sm" c="var(--tx3)">
                            Imported from {r.source}
                        </Text>
                    </Group>
                )}
            </Group>
        </Stack>
    );
}

/* -------------------------------------------------------------- stats row */

const dashedField = {
    height: "auto",
    minHeight: 0,
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: "var(--ls-snug)",
    padding: "0 6px",
    borderRadius: 10,
    border: "1px dashed var(--ac)",
    background: "var(--acs)",
    color: "var(--tx)",
} as const;

function StatsRow({ recipes }: { recipes: RecipesState }) {
    const r = recipes.selected;
    const { editing } = recipes;
    const macros = macroSlices(r);

    return (
        <Flex wrap="wrap" gap="sm">
            <Stack gap="sm" style={{ flex: "1 1 260px" }}>
                <Box
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "var(--mantine-spacing-sm)",
                    }}
                >
                    <Box p="md" bg="var(--sf2)" style={{ borderRadius: 18 }}>
                        <Text fz="xxs" c="var(--tx3)">
                            Total time
                        </Text>
                        {editing ? (
                            <Group
                                gap="xxs"
                                wrap="nowrap"
                                mt="xxs"
                                align="baseline"
                            >
                                <TextInput
                                    variant="unstyled"
                                    w={64}
                                    value={String(r.minutes)}
                                    inputMode="numeric"
                                    onChange={(e) => {
                                        const v = e.currentTarget.value.replace(
                                            /\D/g,
                                            ""
                                        );
                                        recipes.editSelected((x) => {
                                            x.minutes = Number(v) || 0;
                                        });
                                    }}
                                    styles={{ input: dashedField }}
                                />
                                <Text fz="sm" c="var(--tx3)">
                                    min
                                </Text>
                            </Group>
                        ) : (
                            <Text
                                fz="xxl"
                                fw={700}
                                lts="var(--ls-snug)"
                                mt="xxs"
                            >
                                {r.minutes}
                                <Text
                                    component="span"
                                    fz="sm"
                                    fw={500}
                                    c="var(--tx3)"
                                >
                                    {" "}
                                    min
                                </Text>
                            </Text>
                        )}
                    </Box>
                    <Group
                        gap="xs"
                        wrap="nowrap"
                        bg="var(--sf2)"
                        pl="md"
                        pr="sm"
                        py="sm"
                        style={{ borderRadius: 18 }}
                    >
                        <Box style={{ flex: 1 }}>
                            <Text fz="xxs" c="var(--tx3)">
                                Servings
                            </Text>
                            <Text
                                fz="xxl"
                                fw={700}
                                lts="var(--ls-snug)"
                                mt="xxs"
                            >
                                {recipes.servings}
                            </Text>
                        </Box>
                        <Stack gap="xxs">
                            <ActionIcon
                                variant="subtle"
                                w={30}
                                h={24}
                                miw={30}
                                mih={24}
                                radius="xs"
                                bg="var(--sf)"
                                c="var(--tx)"
                                aria-label="More servings"
                                onClick={() =>
                                    recipes.setServings(recipes.servings + 1)
                                }
                            >
                                <Plus size={14} />
                            </ActionIcon>
                            <ActionIcon
                                variant="subtle"
                                w={30}
                                h={24}
                                miw={30}
                                mih={24}
                                radius="xs"
                                bg="var(--sf)"
                                c="var(--tx)"
                                aria-label="Fewer servings"
                                onClick={() =>
                                    recipes.setServings(recipes.servings - 1)
                                }
                            >
                                <Minus size={14} />
                            </ActionIcon>
                        </Stack>
                    </Group>
                </Box>
                <Button
                    variant="filled"
                    radius="lg"
                    fz="lg"
                    fw={700}
                    h="auto"
                    mih={60}
                    onClick={recipes.startCook}
                    leftSection={<ChefHat size={20} />}
                    rightSection={
                        <Text
                            component="span"
                            fz="sm"
                            fw={500}
                            style={{ opacity: 0.7, whiteSpace: "nowrap" }}
                        >
                            {recipes.steps.length} steps
                        </Text>
                    }
                    style={{ flex: 1 }}
                    styles={{ inner: { gap: "var(--mantine-spacing-sm)" } }}
                >
                    Start cooking
                </Button>
            </Stack>

            <Stack
                gap="md"
                p="lg"
                bg="var(--sf2)"
                style={{ flex: "1.2 1 320px", borderRadius: 20 }}
            >
                <Group gap="sm" align="baseline" wrap="nowrap">
                    <Text fz={30} fw={700} lts="var(--ls-tight)">
                        {r.kcal ?? "—"}
                    </Text>
                    <Text fz="sm" c="var(--tx3)">
                        kcal per serving
                    </Text>
                </Group>
                {macros ? (
                    <>
                        <Flex
                            h={12}
                            gap="xxs"
                            style={{
                                borderRadius: "var(--mantine-radius-pill)",
                                overflow: "hidden",
                            }}
                        >
                            {macros.map((m) => (
                                <Box
                                    key={m.label}
                                    h="100%"
                                    style={{
                                        width: `${m.pct}%`,
                                        background: m.color,
                                    }}
                                />
                            ))}
                        </Flex>
                        <Box
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(4, minmax(0, 1fr))",
                                gap: "var(--mantine-spacing-xs)",
                            }}
                        >
                            {macros.map((m) => (
                                <MacroTile
                                    key={m.label}
                                    color={m.color}
                                    label={m.label}
                                    grams={m.grams}
                                    share={`${m.pct}% kcal`}
                                />
                            ))}
                            <MacroTile
                                color="var(--ro)"
                                label="Fibre"
                                grams={r.fibre}
                                share={
                                    r.fibre == null ? "—" : fibreLabel(r.fibre)
                                }
                            />
                        </Box>
                    </>
                ) : (
                    <Text fz="sm" c="var(--tx3)">
                        Nutrition appears once ingredients are matched to
                        Alimenta foods.
                    </Text>
                )}
            </Stack>
        </Flex>
    );
}

function MacroTile({
    color,
    label,
    grams,
    share,
}: {
    color: string;
    label: string;
    grams: number | null;
    share: string;
}) {
    return (
        <Box>
            <Group gap={5} wrap="nowrap" fz="xxs" c="var(--tx3)">
                <Box
                    w={8}
                    h={8}
                    style={{ borderRadius: 3, background: color }}
                />
                <Text fz="xxs" c="var(--tx3)">
                    {label}
                </Text>
            </Group>
            <Text fz={17} fw={700} mt={2}>
                {grams ?? "—"}
                <Text component="span" fz="xs" fw={500} c="var(--tx3)">
                    {" "}
                    g
                </Text>
            </Text>
            <Text fz="xxs" c="var(--tx3)">
                {share}
            </Text>
        </Box>
    );
}

/* ---------------------------------------------------------------- remixes */

function RemixList({ recipe }: { recipe: Recipe }) {
    return (
        <Stack gap="sm">
            <Text fz={20} fw={700} lts="var(--ls-snug)">
                Remixes
            </Text>
            <Box
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: "var(--mantine-spacing-sm)",
                }}
            >
                {recipe.remixes.map((x, i) => (
                    <Group
                        key={`${x.name}-${i}`}
                        gap="sm"
                        wrap="nowrap"
                        p="md"
                        style={{
                            borderRadius: "var(--mantine-radius-lg)",
                            border: "1px solid var(--bd)",
                        }}
                    >
                        <Box
                            w={34}
                            h={34}
                            bg="var(--sf2)"
                            c="var(--tx2)"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "var(--mantine-radius-sm)",
                                flexShrink: 0,
                            }}
                        >
                            <GitFork size={15} />
                        </Box>
                        <Box miw={0}>
                            <Text fw={600} truncate>
                                {x.name}
                            </Text>
                            <Text fz="xs" c="var(--tx3)">
                                by {x.author}
                            </Text>
                        </Box>
                    </Group>
                ))}
            </Box>
        </Stack>
    );
}

/* --------------------------------------------------------------- comments */

function CommentsSection({ recipes }: { recipes: RecipesState }) {
    const r = recipes.selected;
    const [draft, setDraft] = useState("");
    const canPost = draft.trim().length > 0;

    const post = () => {
        if (!canPost) return;
        recipes.postComment(draft);
        setDraft("");
    };

    return (
        <Stack gap="md" pt="xl" style={{ borderTop: "1px solid var(--bd)" }}>
            <Group gap="sm" wrap="nowrap">
                <Text fz={20} fw={700} lts="var(--ls-snug)" style={{ flex: 1 }}>
                    Ratings & comments
                </Text>
                {r.rating != null && (
                    <Text fz="sm" c="var(--tx3)">
                        {r.comments.length}{" "}
                        {r.comments.length === 1 ? "comment" : "comments"}
                    </Text>
                )}
            </Group>

            {r.visibility === "private" ? (
                <Group
                    gap="sm"
                    wrap="nowrap"
                    p="lg"
                    bg="var(--sf2)"
                    fz="sm"
                    c="var(--tx2)"
                    style={{ borderRadius: "var(--mantine-radius-lg)" }}
                >
                    <Lock size={15} />
                    <Text fz="sm" c="var(--tx2)">
                        Private recipes don&apos;t collect ratings. Share by
                        link or publicly to open comments.
                    </Text>
                </Group>
            ) : (
                <>
                    <Stack
                        gap="sm"
                        p="md"
                        bg="var(--sf2)"
                        style={{ borderRadius: 18 }}
                    >
                        <Group gap="sm" wrap="nowrap">
                            <Text fz="sm" c="var(--tx2)">
                                Your rating
                            </Text>
                            <Group gap={2} wrap="nowrap">
                                {STARS.map((n) => (
                                    <UnstyledButton
                                        key={n}
                                        aria-label={`Rate ${n} star${n === 1 ? "" : "s"}`}
                                        onClick={() => recipes.rate(n)}
                                        w={30}
                                        h={30}
                                        fz={20}
                                        lh={1}
                                        ta="center"
                                        c={
                                            n <= recipes.myRating
                                                ? "var(--am)"
                                                : "var(--bd2)"
                                        }
                                        style={{
                                            borderRadius:
                                                "var(--mantine-radius-xs)",
                                        }}
                                    >
                                        ★
                                    </UnstyledButton>
                                ))}
                            </Group>
                        </Group>
                        <Group gap="sm" wrap="nowrap">
                            <TextInput
                                value={draft}
                                placeholder="Share a tip or tweak…"
                                radius="md"
                                onChange={(e) =>
                                    setDraft(e.currentTarget.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") post();
                                }}
                                style={{ flex: 1, minWidth: 0 }}
                                styles={{
                                    input: {
                                        height: 42,
                                        minHeight: 42,
                                        background: "var(--sf)",
                                        borderColor: "var(--bd2)",
                                    },
                                }}
                            />
                            <Button
                                variant="filled"
                                radius="md"
                                h={42}
                                fw={700}
                                onClick={post}
                                style={{
                                    opacity: canPost ? 1 : 0.4,
                                    transition: "opacity var(--motion-fast)",
                                }}
                            >
                                Post
                            </Button>
                        </Group>
                    </Stack>

                    {r.comments.map((c, i) => {
                        const hue = AVATAR_HUES[i % AVATAR_HUES.length];
                        const meta = [c.place, c.when]
                            .filter(Boolean)
                            .join(" · ");
                        return (
                            <Group
                                key={`${c.author}-${c.when}-${i}`}
                                gap="md"
                                wrap="nowrap"
                                align="flex-start"
                                py="xxs"
                            >
                                <Box
                                    w={36}
                                    h={36}
                                    bg={hueTile(hue)}
                                    c={hueColor(hue)}
                                    fz="sm"
                                    fw={700}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius:
                                            "var(--mantine-radius-pill)",
                                        flexShrink: 0,
                                    }}
                                >
                                    {c.author.charAt(0).toUpperCase()}
                                </Box>
                                <Box style={{ flex: 1, minWidth: 0 }}>
                                    <Group gap="sm" wrap="wrap">
                                        <Text fw={600}>{c.author}</Text>
                                        {meta && (
                                            <Text fz="xs" c="var(--tx3)">
                                                {meta}
                                            </Text>
                                        )}
                                        {c.stars != null && c.stars > 0 && (
                                            <Text
                                                fz="xs"
                                                c="var(--am)"
                                                style={{ letterSpacing: 1 }}
                                            >
                                                {"★".repeat(c.stars)}
                                            </Text>
                                        )}
                                    </Group>
                                    <Text
                                        c="var(--tx2)"
                                        lh="md"
                                        mt={2}
                                        style={{ textWrap: "pretty" }}
                                    >
                                        {c.text}
                                    </Text>
                                </Box>
                            </Group>
                        );
                    })}
                </>
            )}
        </Stack>
    );
}
