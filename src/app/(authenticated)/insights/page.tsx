"use client";
import { useMemo } from "react";
import Link from "next/link";
import {
    Badge,
    Box,
    Button,
    Card,
    Flex,
    Grid,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
} from "@mantine/core";
import { mealsRepo } from "@/apis/meal/mealsRepo";
import { TopFoodsChart } from "@/components/charts/top-foods-chart";
import { MoodTrendChart } from "@/components/charts/mood-trend-chart";
import { CalendarDays, ChartLine, Plus } from "lucide-react";

const CARD_TITLE = { fw: 700, fz: "lg" } as const;

/** Rated meals needed before the insight cards replace the empty state. */
const MIN_RATED_MEALS = 3;

function scoreTone(score: number) {
    if (score >= 4) return "var(--ac)";
    if (score >= 3) return "var(--am)";
    return "var(--ro)";
}

function HeroStat({ value, label }: { value: string; label: string }) {
    return (
        <Paper
            radius="lg"
            p="md"
            shadow="none"
            withBorder={false}
            c="white"
            bg="rgba(255,255,255,0.16)"
            style={{ backdropFilter: "blur(10px)" }}
        >
            <Text
                fz="xxl"
                fw={700}
                lh="xs"
                style={{
                    letterSpacing: "var(--ls-snug)",
                    fontVariantNumeric: "tabular-nums",
                }}
            >
                {value}
            </Text>
            <Text fz="xs" mt="xxs" opacity={0.85}>
                {label}
            </Text>
        </Paper>
    );
}

function LegendDot({ color, label }: { color: string; label: string }) {
    return (
        <Group gap="xs" align="center" wrap="nowrap">
            <Box
                w={8}
                h={8}
                bg={color}
                style={{ borderRadius: "var(--mantine-radius-pill)" }}
            />
            <Text fz="xs" c="var(--tx3)">
                {label}
            </Text>
        </Group>
    );
}

export default function InsightsPage() {
    const topFoods = useMemo(() => mealsRepo.topFoods(8), []);
    const moodTrend = useMemo(() => mealsRepo.moodTrend(), []);
    const digestCorr = useMemo(() => mealsRepo.digestCorrelation(6), []);
    const meals = useMemo(() => mealsRepo.list(), []);

    // Favorites: meals with highest avg mood+energy
    const favorites = useMemo(() => {
        return meals
            .filter((m) => m.mood !== undefined && m.energy !== undefined)
            .map((m) => ({
                title: m.title,
                score: (m.mood! + m.energy!) / 2,
                mealType: m.type,
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
    }, [meals]);

    // Hero numbers — all derived from the meals already loaded above.
    const hero = useMemo(() => {
        const rated = meals.filter(
            (m) => m.mood !== undefined && m.energy !== undefined
        );
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const thisWeek = meals.filter(
            (m) => new Date(m.mealTime) >= weekAgo
        ).length;
        const avg = (pick: (m: (typeof rated)[number]) => number) =>
            rated.length
                ? (
                      rated.reduce((sum, m) => sum + pick(m), 0) / rated.length
                  ).toFixed(1)
                : "—";

        const bestDay = moodTrend.reduce<(typeof moodTrend)[number] | null>(
            (best, day) =>
                day.mood > 0 && (!best || day.mood > best.mood) ? day : best,
            null
        );
        const topFood = topFoods[0];
        const headline =
            topFood && bestDay
                ? `${topFood.food} is your go-to, and your mood peaked on ${bestDay.date}.`
                : topFood
                  ? `${topFood.food} is your go-to — logged ${topFood.count} times.`
                  : "Keep logging and your patterns will show up here.";

        return {
            ratedCount: rated.length,
            headline,
            stats: [
                { value: String(thisWeek), label: "Meals this week" },
                { value: avg((m) => m.mood!), label: "Avg mood" },
                { value: avg((m) => m.energy!), label: "Avg energy" },
            ],
        };
    }, [meals, moodTrend, topFoods]);

    if (hero.ratedCount < MIN_RATED_MEALS) {
        const filled = Math.min(hero.ratedCount, MIN_RATED_MEALS);
        return (
            <Paper px="xxl" py={48} withBorder>
                <Stack align="center" gap="md" ta="center">
                    <ThemeIcon size={72} radius="xl" variant="gradient">
                        <ChartLine size={32} />
                    </ThemeIcon>
                    <Text
                        fz="xxl"
                        fw={700}
                        style={{ letterSpacing: "var(--ls-snug)" }}
                    >
                        Insights need a few meals
                    </Text>
                    <Text fz="md" c="var(--tx2)" maw={440} lh="lg">
                        Log {MIN_RATED_MEALS} meals with how they made you feel
                        and we&apos;ll start spotting what lifts your mood and
                        energy.
                    </Text>
                    <Group gap="xs" my="xxs">
                        {Array.from({ length: MIN_RATED_MEALS }, (_, i) => (
                            <Box
                                key={i}
                                w={56}
                                h={8}
                                bg={i < filled ? "var(--ac)" : "var(--sf2)"}
                                style={{
                                    borderRadius: "var(--mantine-radius-pill)",
                                }}
                            />
                        ))}
                    </Group>
                    <Text fz="xs" c="var(--tx3)">
                        {filled} of {MIN_RATED_MEALS} meals
                    </Text>
                    <Button
                        component={Link}
                        href="/log"
                        mt="xs"
                        size="md"
                        leftSection={<Plus size={16} />}
                    >
                        Log a meal
                    </Button>
                </Stack>
            </Paper>
        );
    }

    return (
        <Flex wrap="wrap" gap="md">
            {/* Hero banner */}
            <Paper
                radius="xxl"
                px={34}
                py="xxl"
                shadow="none"
                withBorder={false}
                c="white"
                pos="relative"
                style={{
                    flex: "12 1 900px",
                    minWidth: 0,
                    overflow: "hidden",
                    background:
                        "linear-gradient(120deg, color-mix(in srgb, var(--ac) 88%, #000), color-mix(in srgb, var(--bl) 80%, #000))",
                }}
            >
                <Box
                    pos="absolute"
                    w={380}
                    h={380}
                    bg="rgba(255,255,255,0.12)"
                    style={{
                        right: -80,
                        top: -120,
                        borderRadius: "var(--mantine-radius-pill)",
                    }}
                />
                <Grid gap="xxl" align="flex-end" pos="relative">
                    <Grid.Col span={{ base: 12, md: 7 }}>
                        <Text fz="sm" fw={600} opacity={0.85}>
                            Your biggest pattern this week
                        </Text>
                        <Text
                            fz={{ base: "display", sm: 38 }}
                            fw={700}
                            lh="xs"
                            mt="sm"
                            style={{
                                letterSpacing: "var(--ls-snug)",
                                textWrap: "balance",
                            }}
                        >
                            {hero.headline}
                        </Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 5 }}>
                        <SimpleGrid cols={3} spacing="sm">
                            {hero.stats.map((s) => (
                                <HeroStat
                                    key={s.label}
                                    value={s.value}
                                    label={s.label}
                                />
                            ))}
                        </SimpleGrid>
                    </Grid.Col>
                </Grid>
            </Paper>

            {/* Mood & energy */}
            <Card style={{ flex: "7 1 440px", minWidth: 0 }}>
                <Group justify="space-between" align="baseline" wrap="nowrap">
                    <Text {...CARD_TITLE}>Mood &amp; energy</Text>
                    <Group gap="md" wrap="nowrap">
                        <LegendDot color="var(--ac)" label="Mood" />
                        <LegendDot color="var(--bl)" label="Energy" />
                    </Group>
                </Group>
                <MoodTrendChart data={moodTrend} />
            </Card>

            {/* Most eaten */}
            <Card style={{ flex: "5 1 360px", minWidth: 0 }}>
                <Text {...CARD_TITLE}>Your most eaten</Text>
                <TopFoodsChart data={topFoods} />
            </Card>

            {/* Digestion */}
            <Card style={{ flex: "5 1 360px", minWidth: 0 }}>
                <Text {...CARD_TITLE}>Easiest on digestion</Text>
                <Text fz="xs" c="var(--tx3)" mt="xxs">
                    Average digestion score after eating
                </Text>
                {digestCorr.length === 0 ? (
                    <Text fz="sm" c="var(--tx3)" ta="center" py="xl">
                        Rate digestion on a few meals to see this.
                    </Text>
                ) : (
                    <SimpleGrid cols={2} spacing="sm" mt="lg">
                        {digestCorr.map((d) => {
                            const tone = scoreTone(d.avgDigestion);
                            return (
                                <Paper
                                    key={d.food}
                                    radius="lg"
                                    px="md"
                                    py="md"
                                    bg="var(--sf2)"
                                    shadow="none"
                                    withBorder={false}
                                    style={{
                                        transition: `transform var(--motion-fast)`,
                                    }}
                                >
                                    <Group
                                        justify="space-between"
                                        gap="sm"
                                        wrap="nowrap"
                                    >
                                        <Text fw={500} fz="md" truncate="end">
                                            {d.food}
                                        </Text>
                                        <Text
                                            component="span"
                                            h={24}
                                            px="sm"
                                            fz="xs"
                                            fw={700}
                                            lh="24px"
                                            c={tone}
                                            bg={`color-mix(in srgb, ${tone} 16%, transparent)`}
                                            style={{
                                                borderRadius:
                                                    "var(--mantine-radius-pill)",
                                                flexShrink: 0,
                                                fontVariantNumeric:
                                                    "tabular-nums",
                                            }}
                                        >
                                            {d.avgDigestion.toFixed(1)}
                                        </Text>
                                    </Group>
                                </Paper>
                            );
                        })}
                    </SimpleGrid>
                )}
            </Card>

            {/* Top rated meals */}
            <Card style={{ flex: "4 1 300px", minWidth: 0 }}>
                <Text {...CARD_TITLE}>Top rated meals</Text>
                {favorites.length === 0 ? (
                    <Text fz="sm" c="var(--tx3)" ta="center" py="xl">
                        Log meals with mood/energy to see rankings.
                    </Text>
                ) : (
                    <Stack gap="xs" mt="md">
                        {favorites.map((f, i) => {
                            const first = i === 0;
                            return (
                                <Group
                                    key={f.title + i}
                                    gap="md"
                                    p="xs"
                                    wrap="nowrap"
                                    style={{
                                        borderRadius:
                                            "var(--mantine-radius-md)",
                                        transition: `background var(--motion-fast)`,
                                    }}
                                >
                                    <Box
                                        w={34}
                                        h={34}
                                        display="flex"
                                        fz="sm"
                                        fw={700}
                                        c={
                                            first
                                                ? "var(--ink-on-gradient)"
                                                : "var(--tx2)"
                                        }
                                        bg={
                                            first
                                                ? "linear-gradient(135deg, var(--am), var(--ro))"
                                                : "var(--sf2)"
                                        }
                                        style={{
                                            borderRadius:
                                                "var(--mantine-radius-sm)",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {i + 1}
                                    </Box>
                                    <Box flex={1} miw={0}>
                                        <Text fw={600} fz="md" truncate="end">
                                            {f.title}
                                        </Text>
                                        <Text
                                            fz="xs"
                                            c="var(--tx3)"
                                            tt="capitalize"
                                        >
                                            {f.mealType.toLowerCase()}
                                        </Text>
                                    </Box>
                                    <Text
                                        fw={700}
                                        fz="md"
                                        c="var(--ac)"
                                        style={{
                                            fontVariantNumeric: "tabular-nums",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {f.score.toFixed(1)}
                                        <Text
                                            component="span"
                                            fz="xs"
                                            fw={500}
                                            c="var(--tx3)"
                                        >
                                            {" "}
                                            /5
                                        </Text>
                                    </Text>
                                </Group>
                            );
                        })}
                    </Stack>
                )}
            </Card>

            {/* Coming soon: Weekly plan generator */}
            <Box
                p={1.5}
                style={{
                    flex: "3 1 240px",
                    minWidth: 0,
                    borderRadius: "var(--mantine-radius-xl)",
                    background: "linear-gradient(135deg, var(--am), var(--ro))",
                    boxShadow: "var(--sh)",
                }}
            >
                <Paper
                    style={{
                        borderRadius: "calc(var(--mantine-radius-xl) - 1.5px)",
                    }}
                    p="xl"
                    h="100%"
                    shadow="none"
                    withBorder={false}
                >
                    <Stack gap="md" h="100%">
                        <ThemeIcon size={38} radius="sm" color="amber">
                            <CalendarDays size={18} />
                        </ThemeIcon>
                        <Text {...CARD_TITLE}>Weekly plans</Text>
                        <Text fz="sm" c="var(--tx2)" lh="lg">
                            A week of meals built from what makes you feel best.
                        </Text>
                        <Badge
                            variant="surface"
                            mt="auto"
                            style={{ alignSelf: "flex-start" }}
                        >
                            Coming soon
                        </Badge>
                    </Stack>
                </Paper>
            </Box>
        </Flex>
    );
}
