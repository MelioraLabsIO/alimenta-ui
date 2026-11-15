"use client";

import {
    ActionIcon,
    Box,
    Button,
    Group,
    Stack,
    Text,
    TextInput,
    UnstyledButton,
} from "@mantine/core";
import { Check, ListPlus, Plus, ShoppingBasket, Trash2, X } from "lucide-react";
import { emptyIngredient } from "@/core/mock/recipes";
import { formatAmount } from "@/lib/recipe-format";
import { ingredientKey } from "./recipe-meta";
import type { RecipesState } from "./useRecipes";

const EDIT_INPUT_STYLES = {
    input: {
        height: 34,
        minHeight: 34,
        borderRadius: 9,
        paddingInline: "var(--mantine-spacing-sm)",
    },
} as const;

/**
 * The ingredient list of the open recipe, one bordered box per section.
 * Viewing shows scaled amounts with a basket toggle per row; editing turns
 * every cell into an input and adds row/section controls.
 */
export function IngredientSections({ recipes }: { recipes: RecipesState }) {
    const r = recipes.selected;
    const { editing, scale } = recipes;

    return (
        <Stack gap="md">
            <Group gap="sm" wrap="nowrap">
                <Text fz={20} fw={700} lts="var(--ls-snug)" style={{ flex: 1 }}>
                    Ingredients
                </Text>
                {!editing && (
                    <Button
                        variant="default"
                        h={34}
                        px="md"
                        radius="pill"
                        fz="xs"
                        fw={600}
                        c="var(--tx)"
                        bg="transparent"
                        leftSection={
                            recipes.allInList ? (
                                <Check size={14} />
                            ) : (
                                <ShoppingBasket size={14} />
                            )
                        }
                        onClick={recipes.addAllToList}
                    >
                        {recipes.allInList ? "All in list" : "Add all to list"}
                    </Button>
                )}
            </Group>

            {r.sections.map((section, si) => (
                <Box
                    key={si}
                    style={{
                        borderRadius: 20,
                        border: "1px solid var(--bd)",
                        overflow: "hidden",
                    }}
                >
                    <Group
                        gap="sm"
                        wrap="nowrap"
                        px="lg"
                        py="sm"
                        bg="var(--sf2)"
                    >
                        {editing ? (
                            <>
                                <TextInput
                                    variant="unstyled"
                                    value={section.name}
                                    aria-label="Section name"
                                    onChange={(e) => {
                                        const v = e.currentTarget.value;
                                        recipes.editSelected((x) => {
                                            x.sections[si].name = v;
                                        });
                                    }}
                                    style={{ flex: 1 }}
                                    styles={{
                                        input: {
                                            height: 30,
                                            minHeight: 30,
                                            paddingInline:
                                                "var(--mantine-spacing-sm)",
                                            borderRadius: 9,
                                            border: "1px dashed var(--ac)",
                                            fontWeight: 700,
                                            color: "var(--tx)",
                                        },
                                    }}
                                />
                                {r.sections.length > 1 && (
                                    <ActionIcon
                                        variant="subtle"
                                        size={30}
                                        radius="xs"
                                        c="var(--tx3)"
                                        aria-label="Remove section"
                                        title="Remove section"
                                        onClick={() =>
                                            recipes.editSelected((x) => {
                                                x.sections.splice(si, 1);
                                            })
                                        }
                                    >
                                        <Trash2 size={15} />
                                    </ActionIcon>
                                )}
                            </>
                        ) : (
                            <>
                                <Text fw={700} style={{ flex: 1 }}>
                                    {section.name}
                                </Text>
                                <Text fz="xs" c="var(--tx3)">
                                    {section.ingredients.length} items
                                </Text>
                            </>
                        )}
                    </Group>

                    {section.ingredients.map((ing, ii) => {
                        const key = ingredientKey(r.id, si, ii);
                        const amount = formatAmount(
                            ing.quantity == null ? null : ing.quantity * scale,
                            ing.unit
                        );
                        const inList = recipes.shoppingList.some(
                            (x) => x.key === key
                        );

                        return (
                            <Box
                                key={ii}
                                style={{ borderTop: "1px solid var(--bd)" }}
                            >
                                {editing ? (
                                    <Box
                                        p="sm"
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns:
                                                "64px 60px minmax(0,1fr) minmax(0,0.8fr) 32px",
                                            gap: "var(--mantine-spacing-xs)",
                                            alignItems: "center",
                                        }}
                                    >
                                        <TextInput
                                            value={ing.quantity ?? ""}
                                            placeholder="—"
                                            aria-label="Quantity"
                                            inputMode="decimal"
                                            onChange={(e) => {
                                                const v = e.currentTarget.value;
                                                recipes.editSelected((x) => {
                                                    x.sections[si].ingredients[
                                                        ii
                                                    ].quantity =
                                                        v === "" || isNaN(+v)
                                                            ? null
                                                            : +v;
                                                });
                                            }}
                                            styles={{
                                                input: {
                                                    ...EDIT_INPUT_STYLES.input,
                                                    textAlign: "right",
                                                    fontFamily:
                                                        "var(--font-mono)",
                                                },
                                            }}
                                        />
                                        <TextInput
                                            value={ing.unit}
                                            placeholder="unit"
                                            aria-label="Unit"
                                            onChange={(e) => {
                                                const v = e.currentTarget.value;
                                                recipes.editSelected((x) => {
                                                    x.sections[si].ingredients[
                                                        ii
                                                    ].unit = v;
                                                });
                                            }}
                                            styles={EDIT_INPUT_STYLES}
                                        />
                                        <TextInput
                                            value={ing.name}
                                            placeholder="Ingredient"
                                            aria-label="Ingredient"
                                            onChange={(e) => {
                                                const v = e.currentTarget.value;
                                                recipes.editSelected((x) => {
                                                    x.sections[si].ingredients[
                                                        ii
                                                    ].name = v;
                                                });
                                            }}
                                            styles={{
                                                input: {
                                                    ...EDIT_INPUT_STYLES.input,
                                                    fontWeight: 500,
                                                },
                                            }}
                                        />
                                        <TextInput
                                            value={ing.note}
                                            placeholder="Note"
                                            aria-label="Note"
                                            onChange={(e) => {
                                                const v = e.currentTarget.value;
                                                recipes.editSelected((x) => {
                                                    x.sections[si].ingredients[
                                                        ii
                                                    ].note = v;
                                                });
                                            }}
                                            styles={EDIT_INPUT_STYLES}
                                        />
                                        <ActionIcon
                                            variant="subtle"
                                            size={32}
                                            radius="xs"
                                            c="var(--tx3)"
                                            aria-label="Remove ingredient"
                                            title="Remove"
                                            onClick={() =>
                                                recipes.editSelected((x) => {
                                                    x.sections[
                                                        si
                                                    ].ingredients.splice(ii, 1);
                                                })
                                            }
                                        >
                                            <X size={15} />
                                        </ActionIcon>
                                    </Box>
                                ) : (
                                    <Box
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns:
                                                "110px minmax(0,1fr) minmax(0,0.8fr) 36px",
                                            gap: "var(--mantine-spacing-lg)",
                                            alignItems: "center",
                                            padding: "9px 10px 9px 16px",
                                        }}
                                    >
                                        <Text
                                            ta="right"
                                            ff="var(--font-mono)"
                                            fz="md"
                                            fw={600}
                                            c="var(--ac)"
                                            style={{
                                                fontVariantNumeric:
                                                    "tabular-nums",
                                            }}
                                        >
                                            {amount}
                                        </Text>
                                        <Text fz="md" fw={500}>
                                            {ing.name}
                                        </Text>
                                        <Text fz="sm" c="var(--tx3)">
                                            {ing.note}
                                        </Text>
                                        <ActionIcon
                                            variant="subtle"
                                            size={32}
                                            radius="xs"
                                            bg={
                                                inList
                                                    ? "var(--acs)"
                                                    : "transparent"
                                            }
                                            c={
                                                inList
                                                    ? "var(--ac)"
                                                    : "var(--tx3)"
                                            }
                                            aria-label={
                                                inList
                                                    ? "In your list"
                                                    : "Add to shopping list"
                                            }
                                            title={
                                                inList
                                                    ? "In your list"
                                                    : "Add to shopping list"
                                            }
                                            onClick={() =>
                                                recipes.toggleShoppingItem({
                                                    key,
                                                    name: ing.name,
                                                    amount,
                                                    from: r.name,
                                                })
                                            }
                                        >
                                            {inList ? (
                                                <Check size={15} />
                                            ) : (
                                                <ShoppingBasket size={15} />
                                            )}
                                        </ActionIcon>
                                    </Box>
                                )}
                            </Box>
                        );
                    })}

                    {editing && (
                        <UnstyledButton
                            w="100%"
                            h={38}
                            c="var(--ac)"
                            fz="xs"
                            fw={700}
                            style={{
                                borderTop: "1px solid var(--bd)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "var(--mantine-spacing-xs)",
                            }}
                            onClick={() =>
                                recipes.editSelected((x) => {
                                    x.sections[si].ingredients.push(
                                        emptyIngredient()
                                    );
                                })
                            }
                        >
                            <Plus size={14} />
                            Ingredient
                        </UnstyledButton>
                    )}
                </Box>
            ))}

            {editing && (
                <UnstyledButton
                    h={42}
                    c="var(--tx)"
                    fw={600}
                    style={{
                        borderRadius: "var(--mantine-radius-lg)",
                        border: "1px dashed var(--bd2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "var(--mantine-spacing-sm)",
                    }}
                    onClick={recipes.addSection}
                >
                    <ListPlus size={16} />
                    Add section
                </UnstyledButton>
            )}
        </Stack>
    );
}
