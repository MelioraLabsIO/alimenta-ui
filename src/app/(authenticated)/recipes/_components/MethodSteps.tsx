"use client";

import {
    ActionIcon,
    Box,
    Group,
    Stack,
    Text,
    Textarea,
    UnstyledButton,
} from "@mantine/core";
import { BellRing, Pause, Plus, Timer, X } from "lucide-react";
import { formatClock, formatDuration } from "@/lib/recipe-format";
import type { RecipesState } from "./useRecipes";

/**
 * The open recipe's steps, numbered continuously across sections, each with
 * an inline timer when its text names a duration. Editing swaps the text for
 * a textarea and adds remove / add-step controls.
 */
export function MethodSteps({ recipes }: { recipes: RecipesState }) {
    const r = recipes.selected;
    const { editing } = recipes;
    // Steps number continuously across sections: each section starts where
    // the previous one left off.
    const offsets = r.sections.map((_, i) =>
        r.sections.slice(0, i).reduce((sum, s) => sum + s.steps.length, 0)
    );

    return (
        <Stack gap="lg">
            <Text fz={20} fw={700} lts="var(--ls-snug)">
                Method
            </Text>

            {r.sections.map((section, si) => (
                <Stack key={si} gap="md">
                    {(r.sections.length > 1 || editing) && (
                        <Text
                            fz="xs"
                            fw={700}
                            c="var(--tx3)"
                            tt="uppercase"
                            lts="var(--ls-wide)"
                        >
                            {section.name}
                        </Text>
                    )}

                    {section.steps.map((text, ti) => {
                        const stepNo = offsets[si] + ti + 1;
                        const secs = recipes.stepSeconds(text);
                        const key = recipes.stepKey(stepNo);
                        const t = recipes.timers[key];
                        const running = !!t?.running;
                        const done = !!t?.done;

                        return (
                            <Box
                                key={ti}
                                fz="md"
                                lh={1.6}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "32px minmax(0,1fr)",
                                    gap: "var(--mantine-spacing-sm)",
                                }}
                            >
                                <Text
                                    ff="var(--font-mono)"
                                    fz="md"
                                    fw={600}
                                    c="var(--tx3)"
                                    pt={2}
                                    lh={1.6}
                                >
                                    {String(stepNo).padStart(2, "0")}
                                </Text>

                                <Stack gap="sm" align="flex-start">
                                    {editing ? (
                                        <Group
                                            gap="xs"
                                            wrap="nowrap"
                                            w="100%"
                                            align="flex-start"
                                        >
                                            <Textarea
                                                value={text}
                                                autosize
                                                minRows={2}
                                                aria-label={`Step ${stepNo}`}
                                                onChange={(e) => {
                                                    const v =
                                                        e.currentTarget.value;
                                                    recipes.editSelected(
                                                        (x) => {
                                                            x.sections[
                                                                si
                                                            ].steps[ti] = v;
                                                        }
                                                    );
                                                }}
                                                style={{ flex: 1 }}
                                                styles={{
                                                    input: {
                                                        fontSize:
                                                            "var(--mantine-font-size-sm)",
                                                        lineHeight: 1.5,
                                                        paddingTop:
                                                            "var(--mantine-spacing-sm)",
                                                        paddingBottom:
                                                            "var(--mantine-spacing-sm)",
                                                        paddingInline:
                                                            "var(--mantine-spacing-sm)",
                                                        borderRadius: 10,
                                                    },
                                                }}
                                            />
                                            <ActionIcon
                                                variant="subtle"
                                                size={32}
                                                radius="xs"
                                                c="var(--tx3)"
                                                aria-label="Remove step"
                                                title="Remove step"
                                                onClick={() =>
                                                    recipes.editSelected(
                                                        (x) => {
                                                            x.sections[
                                                                si
                                                            ].steps.splice(
                                                                ti,
                                                                1
                                                            );
                                                        }
                                                    )
                                                }
                                            >
                                                <X size={15} />
                                            </ActionIcon>
                                        </Group>
                                    ) : (
                                        <Text
                                            fz="md"
                                            lh={1.6}
                                            style={{ textWrap: "pretty" }}
                                        >
                                            {text}
                                        </Text>
                                    )}

                                    {secs > 0 && (
                                        <UnstyledButton
                                            h={30}
                                            px="md"
                                            ff="var(--font-mono)"
                                            fz="xs"
                                            fw={700}
                                            bg={
                                                running
                                                    ? "var(--ac)"
                                                    : done
                                                      ? "var(--am)"
                                                      : "var(--sf2)"
                                            }
                                            c={
                                                running || done
                                                    ? "var(--act)"
                                                    : "var(--tx)"
                                            }
                                            style={{
                                                borderRadius:
                                                    "var(--mantine-radius-pill)",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "var(--mantine-spacing-xs)",
                                                whiteSpace: "nowrap",
                                                transition: `background-color var(--motion-fast)`,
                                            }}
                                            onClick={() =>
                                                recipes.toggleTimer(key, secs)
                                            }
                                        >
                                            {running ? (
                                                <Pause size={13} />
                                            ) : done ? (
                                                <BellRing size={13} />
                                            ) : (
                                                <Timer size={13} />
                                            )}
                                            {!t
                                                ? `Timer · ${formatDuration(secs)}`
                                                : t.done
                                                  ? "Done"
                                                  : formatClock(t.left)}
                                        </UnstyledButton>
                                    )}
                                </Stack>
                            </Box>
                        );
                    })}

                    {editing && (
                        <UnstyledButton
                            ml={42}
                            h={30}
                            px="md"
                            c="var(--tx2)"
                            fz="xs"
                            fw={600}
                            style={{
                                alignSelf: "flex-start",
                                borderRadius: "var(--mantine-radius-pill)",
                                border: "1px dashed var(--bd2)",
                                display: "flex",
                                alignItems: "center",
                                gap: "var(--mantine-spacing-xs)",
                            }}
                            onClick={() =>
                                recipes.editSelected((x) => {
                                    x.sections[si].steps.push("");
                                })
                            }
                        >
                            <Plus size={13} />
                            Step
                        </UnstyledButton>
                    )}
                </Stack>
            ))}
        </Stack>
    );
}
