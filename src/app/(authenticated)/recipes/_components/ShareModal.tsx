"use client";

import {
    Box,
    Button,
    Group,
    Modal,
    Stack,
    Text,
    UnstyledButton,
} from "@mantine/core";
import { Check, Copy } from "lucide-react";
import { VISIBILITIES, VISIBILITY_META } from "./recipe-meta";
import type { RecipesState } from "./useRecipes";

/** Pick who can see the selected recipe and copy its link. */
export function ShareModal({ recipes }: { recipes: RecipesState }) {
    const r = recipes.selected;
    const isPrivate = r.visibility === "private";

    const note = !r.mine
        ? `Shared by ${r.author}. Your friends get the original; saving makes your own editable copy.`
        : isPrivate
          ? "Copying the link switches this recipe to “Anyone with the link”."
          : r.visibility === "link"
            ? "People with the link can view the recipe and save a copy to their own Alimenta."
            : "Anyone can find this in Alimenta search. Your diary and profile stay private.";

    return (
        <Modal
            opened={recipes.shareOpen}
            onClose={recipes.closeShare}
            size={440}
            title={
                <Box>
                    <Text fz="xs" c="var(--tx3)">
                        Share
                    </Text>
                    <Text fz={20} fw={700} lts="var(--ls-snug)">
                        {r.name}
                    </Text>
                </Box>
            }
        >
            <Stack gap="lg">
                <Stack gap="xs">
                    {VISIBILITIES.map((v) => {
                        const meta = VISIBILITY_META[v];
                        const Icon = meta.icon;
                        const selected = r.visibility === v;
                        return (
                            <UnstyledButton
                                key={v}
                                disabled={!r.mine}
                                display="flex"
                                p="md"
                                c="var(--tx)"
                                aria-pressed={selected}
                                style={{
                                    alignItems: "center",
                                    gap: "var(--mantine-spacing-md)",
                                    borderRadius: "var(--mantine-radius-lg)",
                                    border: `1px solid ${
                                        selected ? "var(--ac)" : "var(--bd)"
                                    }`,
                                    backgroundColor: selected
                                        ? "var(--acs)"
                                        : "transparent",
                                    textAlign: "left",
                                    opacity: r.mine ? 1 : 0.4,
                                    cursor: r.mine ? "pointer" : "default",
                                }}
                                onClick={() => recipes.setVisibility(v)}
                            >
                                <Box
                                    w={34}
                                    h={34}
                                    display="flex"
                                    bg="var(--sf2)"
                                    c={selected ? "var(--ac)" : "var(--tx2)"}
                                    style={{
                                        flexShrink: 0,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius:
                                            "var(--mantine-radius-sm)",
                                    }}
                                >
                                    <Icon size={16} />
                                </Box>
                                <Box flex={1} miw={0}>
                                    <Text fw={600}>{meta.label}</Text>
                                    <Text fz="xs" c="var(--tx3)" mt={2}>
                                        {meta.description}
                                    </Text>
                                </Box>
                                <Box
                                    w={20}
                                    h={20}
                                    style={{
                                        flexShrink: 0,
                                        borderRadius:
                                            "var(--mantine-radius-pill)",
                                        border: `1.5px solid ${
                                            selected
                                                ? "var(--ac)"
                                                : "var(--bd2)"
                                        }`,
                                        background: selected
                                            ? "radial-gradient(circle, var(--ac) 45%, transparent 50%)"
                                            : "transparent",
                                    }}
                                />
                            </UnstyledButton>
                        );
                    })}
                </Stack>

                <Group
                    gap="sm"
                    wrap="nowrap"
                    bg="var(--sf2)"
                    pl="md"
                    pr="xs"
                    py="xs"
                    style={{
                        borderRadius: "var(--mantine-radius-lg)",
                        opacity: isPrivate ? 0.5 : 1,
                    }}
                >
                    <Text
                        flex={1}
                        miw={0}
                        ff="var(--font-mono)"
                        fz="xs"
                        truncate
                    >
                        {recipes.link}
                    </Text>
                    <Button
                        h={36}
                        px="md"
                        radius="md"
                        fw={700}
                        leftSection={
                            recipes.copied ? (
                                <Check size={14} />
                            ) : (
                                <Copy size={14} />
                            )
                        }
                        onClick={recipes.copyLink}
                    >
                        {recipes.copied ? "Copied" : "Copy link"}
                    </Button>
                </Group>

                <Text fz="xs" c="var(--tx3)" lh={1.5}>
                    {note}
                </Text>
            </Stack>
        </Modal>
    );
}
