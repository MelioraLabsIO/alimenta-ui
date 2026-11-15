"use client";

import {
    Box,
    Button,
    Group,
    Modal,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
    UnstyledButton,
} from "@mantine/core";
import {
    Check,
    CircleAlert,
    CircleCheck,
    Flame,
    Globe,
    Link,
    List,
    LoaderCircle,
    ScanSearch,
    Sandwich,
    Sparkles,
    type LucideIcon,
} from "lucide-react";
import { EXAMPLE_IMPORT_URL, PARSED_IMPORT } from "@/core/mock/recipes";
import { formatAmount, hostOf, isUrl } from "@/lib/recipe-format";
import { VISIBILITIES, VISIBILITY_META } from "./recipe-meta";
import { IMPORT_STAGES, type RecipesState } from "./useRecipes";

const STAGE_ICONS: LucideIcon[] = [Globe, List, ScanSearch, Flame];

/** Paste a recipe link, watch it convert, and save the parsed result. */
export function ImportSheet({ recipes }: { recipes: RecipesState }) {
    const url = recipes.importUrl;
    const canConvert = isUrl(url);
    const showStages = recipes.importStage >= 0;
    const parsed = recipes.importStage >= IMPORT_STAGES.length;

    return (
        <Modal
            opened={recipes.importOpen}
            onClose={recipes.closeImport}
            size={640}
            centered={false}
            yOffset={56}
        >
            <Stack gap="md">
                <Box>
                    <Text fz={22} fw={700} lts="var(--ls-tight)">
                        Import from a link
                    </Text>
                    <Text fz="sm" c="var(--tx2)" mt="xxs">
                        Paste any recipe page. We pull out ingredients and
                        steps, match them to Alimenta foods and work out
                        nutrition.
                    </Text>
                </Box>

                <Group gap="sm" wrap="nowrap" align="flex-start">
                    <TextInput
                        flex={1}
                        size="md"
                        radius="md"
                        placeholder="https://…"
                        value={url}
                        onChange={(e) =>
                            recipes.setImportUrl(e.currentTarget.value)
                        }
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && canConvert) {
                                recipes.convert(url.trim());
                            }
                        }}
                        leftSection={<Link size={16} />}
                        styles={{
                            input: {
                                height: 48,
                                backgroundColor: "var(--sf2)",
                                borderColor: "var(--bd2)",
                            },
                        }}
                        aria-label="Recipe link"
                    />
                    <Button
                        h={48}
                        px="lg"
                        radius="md"
                        fw={700}
                        leftSection={<Sparkles size={16} />}
                        disabled={!canConvert}
                        onClick={() => recipes.convert(url.trim())}
                    >
                        Convert
                    </Button>
                </Group>

                {!url && (
                    <Button
                        variant="subtle"
                        size="xs"
                        radius="pill"
                        style={{ alignSelf: "flex-start" }}
                        onClick={() => recipes.setImportUrl(EXAMPLE_IMPORT_URL)}
                    >
                        Try an example link
                    </Button>
                )}

                {showStages && (
                    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
                        {IMPORT_STAGES.map((label, n) => {
                            const Icon = STAGE_ICONS[n] ?? Globe;
                            const doneStage = n < recipes.importStage;
                            const active = n === recipes.importStage;
                            return (
                                <Stack
                                    key={label}
                                    gap="xs"
                                    p={10}
                                    bg="var(--sf2)"
                                    style={{
                                        borderRadius:
                                            "var(--mantine-radius-md)",
                                        opacity: doneStage || active ? 1 : 0.45,
                                        transition:
                                            "opacity var(--motion-normal)",
                                    }}
                                >
                                    <Box
                                        display="flex"
                                        c={
                                            doneStage
                                                ? "var(--ac)"
                                                : active
                                                  ? "var(--tx)"
                                                  : "var(--tx3)"
                                        }
                                    >
                                        {doneStage ? (
                                            <CircleCheck size={15} />
                                        ) : active ? (
                                            <LoaderCircle
                                                size={15}
                                                style={{
                                                    animation:
                                                        "alm-spin 900ms linear infinite",
                                                }}
                                            />
                                        ) : (
                                            <Icon size={15} />
                                        )}
                                    </Box>
                                    <Text fz="xs" fw={600} lh={1.3}>
                                        {label}
                                    </Text>
                                </Stack>
                            );
                        })}
                    </SimpleGrid>
                )}

                {parsed && (
                    <>
                        <Box
                            style={{
                                borderRadius: 22,
                                border: "1px solid var(--bd2)",
                                overflow: "hidden",
                            }}
                        >
                            <Group
                                gap="md"
                                wrap="nowrap"
                                p="lg"
                                style={{
                                    background:
                                        "linear-gradient(120deg, var(--acs), transparent 80%)",
                                }}
                            >
                                <Box
                                    w={44}
                                    h={44}
                                    display="flex"
                                    c="var(--am)"
                                    bg="color-mix(in srgb, var(--am) 18%, transparent)"
                                    style={{
                                        flexShrink: 0,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius:
                                            "var(--mantine-radius-md)",
                                    }}
                                >
                                    <Sandwich size={20} />
                                </Box>
                                <Box flex={1} miw={0}>
                                    <Text fz="xl" fw={700} lts="var(--ls-snug)">
                                        {PARSED_IMPORT.name}
                                    </Text>
                                    <Text fz="xs" c="var(--tx3)">
                                        From {hostOf(url)} ·{" "}
                                        {PARSED_IMPORT.servings} servings ·{" "}
                                        {PARSED_IMPORT.minutes} min ·{" "}
                                        {PARSED_IMPORT.kcal} kcal per serving
                                    </Text>
                                </Box>
                            </Group>

                            {PARSED_IMPORT.sections.map((section) => (
                                <Box
                                    key={section.name}
                                    px="lg"
                                    pt={10}
                                    pb="xs"
                                    style={{ borderTop: "1px solid var(--bd)" }}
                                >
                                    <Text
                                        fz="xs"
                                        fw={700}
                                        c="var(--ac)"
                                        pb="xxs"
                                    >
                                        {section.name}
                                    </Text>
                                    {section.ingredients.map((ing) => {
                                        const matched = ing.match != null;
                                        const matchColor = matched
                                            ? "var(--tx3)"
                                            : "var(--am)";
                                        return (
                                            <Box
                                                key={ing.name}
                                                display="grid"
                                                py="xs"
                                                style={{
                                                    gridTemplateColumns:
                                                        "72px minmax(0, 1fr) auto",
                                                    gap: 10,
                                                    alignItems: "center",
                                                }}
                                            >
                                                <Text
                                                    ta="right"
                                                    ff="var(--font-mono)"
                                                    fz="xs"
                                                    fw={600}
                                                >
                                                    {formatAmount(
                                                        ing.quantity,
                                                        ing.unit
                                                    )}
                                                </Text>
                                                <Box miw={0}>
                                                    <Text fw={500}>
                                                        {ing.name}
                                                    </Text>
                                                    <Text
                                                        fz="xxs"
                                                        c={matchColor}
                                                    >
                                                        {matched
                                                            ? `→ ${ing.match}`
                                                            : "No match — pick a food"}
                                                    </Text>
                                                </Box>
                                                <Box
                                                    display="flex"
                                                    c={matchColor}
                                                >
                                                    {matched ? (
                                                        <CircleCheck
                                                            size={16}
                                                        />
                                                    ) : (
                                                        <CircleAlert
                                                            size={16}
                                                        />
                                                    )}
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            ))}
                        </Box>

                        <Group gap="sm" wrap="wrap" align="center">
                            <Text fz="xs" c="var(--tx3)">
                                Save as
                            </Text>
                            {VISIBILITIES.map((v) => {
                                const meta = VISIBILITY_META[v];
                                const Icon = meta.icon;
                                const selected = recipes.importVisibility === v;
                                return (
                                    <UnstyledButton
                                        key={v}
                                        display="flex"
                                        h={32}
                                        px="md"
                                        fz="xs"
                                        fw={600}
                                        c={
                                            selected
                                                ? "var(--ac)"
                                                : "var(--tx2)"
                                        }
                                        bg={
                                            selected
                                                ? "var(--acs)"
                                                : "transparent"
                                        }
                                        aria-pressed={selected}
                                        style={{
                                            alignItems: "center",
                                            gap: "var(--mantine-spacing-xs)",
                                            borderRadius:
                                                "var(--mantine-radius-pill)",
                                            border: `1px solid ${
                                                selected
                                                    ? "var(--ac)"
                                                    : "var(--bd2)"
                                            }`,
                                        }}
                                        onClick={() =>
                                            recipes.setImportVisibility(v)
                                        }
                                    >
                                        <Icon size={13} />
                                        {meta.short}
                                    </UnstyledButton>
                                );
                            })}
                            <Box flex={1} />
                            <Button
                                h={42}
                                px="lg"
                                radius="pill"
                                fw={700}
                                leftSection={<Check size={16} />}
                                onClick={recipes.saveImport}
                            >
                                Save recipe
                            </Button>
                        </Group>
                    </>
                )}
            </Stack>
        </Modal>
    );
}
