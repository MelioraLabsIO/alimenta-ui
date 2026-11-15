"use client";

import {
    ActionIcon,
    Button,
    Group,
    Paper,
    SegmentedControl,
    Text,
    TextInput,
} from "@mantine/core";
import {
    Bookmark,
    ChefHat,
    Compass,
    Link,
    Plus,
    Search,
    Sparkles,
    X,
    type LucideIcon,
} from "lucide-react";
import type { RecipesState } from "./useRecipes";

/** The three top-level shelves; "mine" also covers its private/shared sub-scopes. */
type TabValue = "community" | "mine" | "saved";

function TabLabel({
    icon: Icon,
    label,
    count,
}: {
    icon: LucideIcon;
    label: string;
    count?: number;
}) {
    return (
        <Group gap="xs" wrap="nowrap">
            <Icon size={15} />
            <Text
                component="span"
                fz="sm"
                fw={600}
                style={{ whiteSpace: "nowrap" }}
            >
                {label}
            </Text>
            {count != null && (
                <Text component="span" fz="xxs" c="var(--tx3)">
                    {count}
                </Text>
            )}
        </Group>
    );
}

/**
 * The glass bar above the library: Discover / My recipes / Saved tabs, the
 * search box (which doubles as the link importer when a URL is pasted), and
 * the Import / Write actions.
 */
export function RecipesToolbar({ recipes }: { recipes: RecipesState }) {
    const { query, queryIsUrl, counts } = recipes;
    const hasQuery = query.length > 0;
    const tab: TabValue = recipes.onMineTab
        ? "mine"
        : recipes.scope === "saved"
          ? "saved"
          : "community";
    const SearchIcon = queryIsUrl ? Link : Search;
    const rightSectionWidth =
        (queryIsUrl ? 104 : 0) + (hasQuery ? 34 : 0) || undefined;

    return (
        <Paper
            radius="xl"
            p="sm"
            bg="var(--glass)"
            style={{ backdropFilter: "blur(18px)" }}
        >
            <Group gap="sm" wrap="wrap">
                <SegmentedControl
                    radius="md"
                    value={tab}
                    onChange={(value) => recipes.setScope(value as TabValue)}
                    data={[
                        {
                            value: "community",
                            label: <TabLabel icon={Compass} label="Discover" />,
                        },
                        {
                            value: "mine",
                            label: (
                                <TabLabel
                                    icon={ChefHat}
                                    label="My recipes"
                                    count={counts.mine}
                                />
                            ),
                        },
                        {
                            value: "saved",
                            label: (
                                <TabLabel
                                    icon={Bookmark}
                                    label="Saved"
                                    count={counts.saved}
                                />
                            ),
                        },
                    ]}
                    styles={{
                        indicator: { borderRadius: "var(--mantine-radius-sm)" },
                        label: {
                            height: 34,
                            display: "flex",
                            alignItems: "center",
                            paddingBlock: 0,
                            paddingInline: "var(--mantine-spacing-md)",
                        },
                    }}
                />

                <TextInput
                    aria-label="Search recipes or paste a link"
                    placeholder="Search recipes or paste a link"
                    value={query}
                    onChange={(e) => recipes.setQuery(e.currentTarget.value)}
                    radius="md"
                    miw={0}
                    style={{ flex: "1 1 220px" }}
                    styles={{ input: { height: 40, minHeight: 40 } }}
                    leftSection={<SearchIcon size={16} />}
                    rightSectionWidth={rightSectionWidth}
                    rightSectionPointerEvents="all"
                    rightSection={
                        queryIsUrl || hasQuery ? (
                            <Group gap="xs" wrap="nowrap" pr="xs">
                                {queryIsUrl && (
                                    <Button
                                        h={30}
                                        px="md"
                                        radius="sm"
                                        fz="xs"
                                        fw={700}
                                        leftSection={<Sparkles size={13} />}
                                        styles={{
                                            inner: {
                                                gap: "var(--mantine-spacing-xs)",
                                            },
                                            root: { boxShadow: "none" },
                                        }}
                                        onClick={() =>
                                            recipes.convert(query.trim())
                                        }
                                    >
                                        Convert
                                    </Button>
                                )}
                                {hasQuery && (
                                    <ActionIcon
                                        variant="subtle"
                                        size={28}
                                        radius="xs"
                                        aria-label="Clear"
                                        c="var(--tx3)"
                                        onClick={recipes.clearQuery}
                                    >
                                        <X size={15} />
                                    </ActionIcon>
                                )}
                            </Group>
                        ) : undefined
                    }
                />

                <Button
                    variant="default"
                    h={40}
                    px="md"
                    radius="md"
                    leftSection={<Link size={15} />}
                    styles={{ inner: { gap: "var(--mantine-spacing-xs)" } }}
                    onClick={recipes.openImport}
                >
                    Import
                </Button>
                <Button
                    h={40}
                    px="lg"
                    radius="md"
                    fw={700}
                    leftSection={<Plus size={16} />}
                    styles={{ inner: { gap: "var(--mantine-spacing-xs)" } }}
                    onClick={recipes.writeNew}
                >
                    Write
                </Button>
            </Group>
        </Paper>
    );
}
