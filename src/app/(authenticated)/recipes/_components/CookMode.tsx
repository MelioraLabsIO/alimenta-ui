"use client";

import {
    ActionIcon,
    Box,
    Button,
    Flex,
    Group,
    Paper,
    Stack,
    Text,
    UnstyledButton,
} from "@mantine/core";
import {
    ArrowLeft,
    ArrowRight,
    BellRing,
    Check,
    Pause,
    RotateCcw,
    Timer,
    X,
} from "lucide-react";
import {
    formatAmount,
    formatClock,
    formatDuration,
    timerSeconds,
} from "@/lib/recipe-format";
import { ingredientKey } from "./recipe-meta";
import type { RecipesState } from "./useRecipes";

/** Full-screen step-by-step view of the selected recipe, with per-step timers. */
export function CookMode({ recipes }: { recipes: RecipesState }) {
    const r = recipes.selected;
    const i = recipes.cookIndex;
    const step = recipes.steps[i];
    const total = recipes.steps.length;
    if (!step) return null;

    const section = r.sections[step.sectionIndex];
    const next = recipes.steps[i + 1];
    const isLast = i >= total - 1;

    const secs = timerSeconds(step.text);
    const timerKey = recipes.stepKey(i + 1);
    const t = recipes.timers[timerKey];
    const running = !!t?.running;
    const done = !!t?.done;
    const timerLabel = !t
        ? `Timer · ${formatDuration(secs)}`
        : t.done
          ? "Done"
          : formatClock(t.left);
    const TimerIcon = running ? Pause : done ? BellRing : Timer;

    return (
        <Paper
            radius="xxl"
            mih={820}
            w="100%"
            display="flex"
            style={{ flexDirection: "column", overflow: "hidden" }}
        >
            {/* Header */}
            <Group
                gap="md"
                wrap="nowrap"
                px="lg"
                py="md"
                style={{ borderBottom: "1px solid var(--bd)" }}
            >
                <Button
                    variant="surface"
                    h={38}
                    radius="md"
                    px="md"
                    fw={600}
                    leftSection={<X size={16} />}
                    onClick={recipes.exitCook}
                >
                    Exit cook mode
                </Button>
                <Box flex={1} miw={0}>
                    <Text fw={700} truncate>
                        {r.name}
                    </Text>
                    <Text fz="xs" c="var(--tx3)">
                        {recipes.servings} servings · step {i + 1} of {total}
                    </Text>
                </Box>
                <Group gap="xxs" wrap="nowrap" visibleFrom="sm">
                    {recipes.steps.map((_, n) => (
                        <UnstyledButton
                            key={n}
                            aria-label={`Go to step ${n + 1}`}
                            w={34}
                            h={8}
                            style={{
                                borderRadius: "var(--mantine-radius-pill)",
                                backgroundColor:
                                    n < i
                                        ? "var(--ac)"
                                        : n === i
                                          ? "var(--tx)"
                                          : "var(--bd2)",
                                transition:
                                    "background-color var(--motion-fast)",
                            }}
                            onClick={() => recipes.setCookStep(n)}
                        />
                    ))}
                </Group>
            </Group>

            {/* Body */}
            <Flex flex={1} wrap="wrap" align="stretch">
                <Stack
                    gap="xl"
                    justify="center"
                    miw={0}
                    style={{
                        flex: "2 1 520px",
                        padding: "48px clamp(20px, 5vw, 72px)",
                    }}
                >
                    <Text
                        fz="sm"
                        fw={700}
                        c="var(--ac)"
                        tt="uppercase"
                        lts="var(--ls-wide)"
                    >
                        {section?.name}
                    </Text>
                    <Flex gap={20} align="flex-start">
                        <Text
                            component="span"
                            fz={72}
                            fw={700}
                            lh={0.9}
                            c="var(--tx3)"
                            lts="var(--ls-tight)"
                            style={{ fontVariantNumeric: "tabular-nums" }}
                        >
                            {i + 1}
                        </Text>
                        <Text
                            fz={34}
                            fw={600}
                            lh={1.3}
                            lts="var(--ls-snug)"
                            style={{ textWrap: "pretty" }}
                        >
                            {step.text}
                        </Text>
                    </Flex>

                    {secs > 0 && (
                        <Group gap={10} wrap="nowrap" pl="xxs">
                            <Button
                                h={64}
                                px={26}
                                radius="xl"
                                fz={26}
                                fw={700}
                                ff="var(--font-mono)"
                                leftSection={<TimerIcon size={22} />}
                                bg={
                                    running
                                        ? "var(--ac)"
                                        : done
                                          ? "var(--am)"
                                          : "var(--sf2)"
                                }
                                c={running || done ? "var(--act)" : "var(--tx)"}
                                styles={{
                                    root: {
                                        boxShadow: "none",
                                        fontVariantNumeric: "tabular-nums",
                                    },
                                    section: {
                                        marginRight:
                                            "var(--mantine-spacing-md)",
                                    },
                                }}
                                onClick={() =>
                                    recipes.toggleTimer(timerKey, secs)
                                }
                            >
                                {timerLabel}
                            </Button>
                            <ActionIcon
                                variant="default"
                                size={52}
                                radius="lg"
                                aria-label="Reset timer"
                                c="var(--tx2)"
                                bg="transparent"
                                onClick={() => recipes.resetTimer(timerKey)}
                            >
                                <RotateCcw size={18} />
                            </ActionIcon>
                        </Group>
                    )}

                    {next && (
                        <Text
                            fz="md"
                            c="var(--tx3)"
                            maw={620}
                            pt={10}
                            style={{ borderTop: "1px solid var(--bd)" }}
                        >
                            Up next · {next.text}
                        </Text>
                    )}
                </Stack>

                <Stack
                    gap={10}
                    p="xl"
                    bg="var(--sf2)"
                    miw={280}
                    style={{ flex: "1 1 300px" }}
                >
                    <Text fw={700}>For this step</Text>
                    {section?.ingredients.map((ing, ii) => {
                        const key = ingredientKey(r.id, step.sectionIndex, ii);
                        const checked = !!recipes.checked[key];
                        return (
                            <UnstyledButton
                                key={key}
                                display="flex"
                                mih={52}
                                px="md"
                                py="sm"
                                bg="var(--sf)"
                                c="var(--tx)"
                                style={{
                                    alignItems: "center",
                                    gap: "var(--mantine-spacing-md)",
                                    borderRadius: "var(--mantine-radius-lg)",
                                    textAlign: "left",
                                    opacity: checked ? 0.45 : 1,
                                    transition: "opacity var(--motion-fast)",
                                }}
                                onClick={() => recipes.toggleChecked(key)}
                            >
                                <Box
                                    w={24}
                                    h={24}
                                    display="flex"
                                    c="var(--act)"
                                    style={{
                                        flexShrink: 0,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius:
                                            "var(--mantine-radius-pill)",
                                        border: `1.5px solid ${
                                            checked ? "var(--ac)" : "var(--bd2)"
                                        }`,
                                        backgroundColor: checked
                                            ? "var(--ac)"
                                            : "transparent",
                                    }}
                                >
                                    <Check
                                        size={14}
                                        style={{ opacity: checked ? 1 : 0 }}
                                    />
                                </Box>
                                <Text
                                    flex={1}
                                    miw={0}
                                    fz="lg"
                                    fw={600}
                                    td={checked ? "line-through" : "none"}
                                >
                                    {ing.name}
                                </Text>
                                <Text
                                    ff="var(--font-mono)"
                                    fw={600}
                                    fz="lg"
                                    style={{ whiteSpace: "nowrap" }}
                                >
                                    {formatAmount(
                                        ing.quantity == null
                                            ? null
                                            : ing.quantity * recipes.scale,
                                        ing.unit
                                    )}
                                </Text>
                            </UnstyledButton>
                        );
                    })}
                </Stack>
            </Flex>

            {/* Footer */}
            <Group
                gap={10}
                wrap="nowrap"
                px="lg"
                py="lg"
                style={{ borderTop: "1px solid var(--bd)" }}
            >
                <Button
                    variant="default"
                    flex={1}
                    h={64}
                    radius="xl"
                    fz={17}
                    fw={600}
                    leftSection={<ArrowLeft size={18} />}
                    style={{ opacity: i === 0 ? 0.35 : 1 }}
                    onClick={recipes.cookPrev}
                >
                    Previous
                </Button>
                <Button
                    flex={2}
                    h={64}
                    radius="xl"
                    fz={17}
                    fw={700}
                    rightSection={
                        isLast ? <Check size={18} /> : <ArrowRight size={18} />
                    }
                    onClick={recipes.cookNext}
                >
                    {isLast ? "Finish" : "Next step"}
                </Button>
            </Group>
        </Paper>
    );
}
