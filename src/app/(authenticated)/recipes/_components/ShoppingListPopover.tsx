"use client";

import type { ReactNode } from "react";
import {
    ActionIcon,
    Box,
    Button,
    Group,
    Popover,
    Stack,
    Text,
    UnstyledButton,
} from "@mantine/core";
import { Check, X } from "lucide-react";
import type { RecipesState } from "./useRecipes";

/**
 * The shopping list, dropped down from the basket button it wraps. Items are
 * collected from any recipe; ticking one crosses it off, X removes it.
 */
export function ShoppingListPopover({
    recipes,
    children,
}: {
    recipes: RecipesState;
    children: ReactNode;
}) {
    const items = recipes.shoppingList;

    return (
        <Popover
            opened={recipes.shopOpen}
            onChange={(o) => !o && recipes.closeShop()}
            position="bottom-end"
            width={340}
            shadow="xl"
            radius="xl"
            withinPortal={false}
        >
            <Popover.Target>{children}</Popover.Target>
            <Popover.Dropdown
                p="md"
                bg="var(--sf)"
                style={{ border: "1px solid var(--bd2)" }}
            >
                <Stack gap="sm">
                    <Group gap="sm" wrap="nowrap">
                        <Text fw={700} style={{ flex: 1 }}>
                            Shopping list
                        </Text>
                        {items.length > 0 && (
                            <Button
                                variant="surface"
                                h={26}
                                px="sm"
                                radius="pill"
                                fz="xxs"
                                fw={600}
                                c="var(--tx2)"
                                onClick={recipes.clearShoppingList}
                            >
                                Clear
                            </Button>
                        )}
                        <ActionIcon
                            variant="subtle"
                            size={26}
                            radius="xs"
                            c="var(--tx3)"
                            aria-label="Close"
                            title="Close"
                            onClick={recipes.closeShop}
                        >
                            <X size={15} />
                        </ActionIcon>
                    </Group>

                    {items.length === 0 && (
                        <Text fz="sm" c="var(--tx3)" py="md">
                            Empty. Tap the basket next to any ingredient, or
                            “Add all”.
                        </Text>
                    )}

                    <Stack
                        gap={0}
                        mah={320}
                        style={{
                            overflow: "auto",
                            scrollbarWidth: "thin",
                            scrollbarColor: "var(--bd2) transparent",
                        }}
                    >
                        {items.map((item) => (
                            <Group
                                key={item.key}
                                gap="sm"
                                wrap="nowrap"
                                py="sm"
                                px={2}
                                style={{ borderBottom: "1px solid var(--bd)" }}
                            >
                                <UnstyledButton
                                    w={22}
                                    h={22}
                                    bg={item.done ? "var(--ac)" : "transparent"}
                                    c="var(--act)"
                                    aria-label="Got it"
                                    title="Got it"
                                    style={{
                                        flexShrink: 0,
                                        borderRadius: 7,
                                        border: `1.5px solid ${
                                            item.done
                                                ? "var(--ac)"
                                                : "var(--bd2)"
                                        }`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        transition: `background-color var(--motion-fast), border-color var(--motion-fast)`,
                                    }}
                                    onClick={() =>
                                        recipes.toggleShoppingDone(item.key)
                                    }
                                >
                                    <Check
                                        size={13}
                                        style={{ opacity: item.done ? 1 : 0 }}
                                    />
                                </UnstyledButton>
                                <Box
                                    miw={0}
                                    style={{
                                        flex: 1,
                                        textDecoration: item.done
                                            ? "line-through"
                                            : "none",
                                        opacity: item.done ? 0.5 : 1,
                                    }}
                                >
                                    <Text fw={600} truncate>
                                        {item.name}
                                    </Text>
                                    <Text fz="xxs" c="var(--tx3)" truncate>
                                        {item.from}
                                    </Text>
                                </Box>
                                <Text
                                    ff="var(--font-mono)"
                                    fz="xs"
                                    fw={600}
                                    style={{ whiteSpace: "nowrap" }}
                                >
                                    {item.amount}
                                </Text>
                                <ActionIcon
                                    variant="subtle"
                                    size={24}
                                    radius="xs"
                                    c="var(--tx3)"
                                    aria-label="Remove"
                                    title="Remove"
                                    onClick={() =>
                                        recipes.removeShoppingItem(item.key)
                                    }
                                >
                                    <X size={14} />
                                </ActionIcon>
                            </Group>
                        ))}
                    </Stack>
                </Stack>
            </Popover.Dropdown>
        </Popover>
    );
}
