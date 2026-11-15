"use client";

import { Box, Button, Modal, SimpleGrid, Stack, Text } from "@mantine/core";
import { Trash2 } from "lucide-react";
import type { RecipesState } from "./useRecipes";

/** Asks before throwing away a draft or reverting edits to a saved recipe. */
export function DiscardConfirmModal({ recipes }: { recipes: RecipesState }) {
    const r = recipes.selected;
    const name = r.name.trim();

    const title = r.draft ? "Discard this recipe?" : "Discard your changes?";
    const body = r.draft
        ? name
            ? `“${name}” hasn’t been saved yet. Everything you’ve written, including the photo, will be lost.`
            : "This recipe hasn’t been saved yet. Everything you’ve written, including the photo, will be lost."
        : `Your edits to “${name}” will be lost and the recipe goes back to how it was.`;

    return (
        <Modal
            opened={recipes.confirmDiscard}
            onClose={recipes.cancelDiscard}
            size={400}
            withCloseButton={false}
            role="alertdialog"
        >
            <Stack gap="md">
                <Box
                    w={44}
                    h={44}
                    display="flex"
                    c="var(--ro)"
                    bg="color-mix(in srgb, var(--ro) 16%, transparent)"
                    style={{
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "var(--mantine-radius-md)",
                    }}
                >
                    <Trash2 size={20} />
                </Box>
                <Text fz={20} fw={700} lts="var(--ls-snug)">
                    {title}
                </Text>
                <Text
                    fz="md"
                    c="var(--tx2)"
                    lh={1.5}
                    style={{ textWrap: "pretty" }}
                >
                    {body}
                </Text>
                <SimpleGrid cols={2} spacing={10} mt="xs">
                    <Button
                        variant="default"
                        h={44}
                        radius="md"
                        fw={600}
                        onClick={recipes.cancelDiscard}
                    >
                        Keep editing
                    </Button>
                    <Button
                        color="rose"
                        h={44}
                        radius="md"
                        fw={700}
                        onClick={recipes.discardEdit}
                    >
                        {r.draft ? "Discard recipe" : "Discard changes"}
                    </Button>
                </SimpleGrid>
            </Stack>
        </Modal>
    );
}
