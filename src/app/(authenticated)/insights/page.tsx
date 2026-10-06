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

const CARD_TITLE = { fw: 700, fz: 16 } as const;

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
            radius={18}
            p={14}
            shadow="none"
            withBorder={false}
            c="#fff"
            bg="rgba(255,255,255,0.16)"
            style={{ backdropFilter: "blur(10px)" }}
        >
            <Text
                fz={26}
                fw={700}
                lh={1.1}
                style={{
                    letterSpacing: "-0.03em",
                    fontVariantNumeric: "tabular-nums",
                }}
            >
                {value}
            </Text>
            <Text fz={12} mt={2} opacity={0.85}>
                {label}
            </Text>
        </Paper>
    );
}

function LegendDot({ color, label }: { color: string; label: string }) {
    return (
        <Group gap={5} align="center" wrap="nowrap">
            <Box w={8} h={8} bg={color} style={{ borderRadius: 999 }} />
            <Text fz={12} c="var(--tx3)">
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
            <Paper px={32} py={48} withBorder>
                <Stack align="center" gap={14} ta="center">
                    <ThemeIcon size={72} radius={22} variant="gradient">
                        <ChartLine size={32} />
                    </ThemeIcon>
                    <Text fz={24} fw={700} style={{ letterSpacing: "-0.03em" }}>
                        Insights need a few meals
                    </Text>
                    <Text fz={14} c="var(--tx2)" maw={440} lh={1.5}>
                        Log {MIN_RATED_MEALS} meals with how they made you feel
                        and we&apos;ll start spotting what lifts your mood and
                        energy.
                    </Text>
                    <Group gap={6} my={4}>
                        {Array.from({ length: MIN_RATED_MEALS }, (_, i) => (
                            <Box
                                key={i}
                                w={56}
                                h={8}
                                bg={i < filled ? "var(--ac)" : "var(--sf2)"}
                                style={{ borderRadius: 999 }}
                            />
                        ))}
                    </Group>
                    <Text fz={12} c="var(--tx3)">
                        {filled} of {MIN_RATED_MEALS} meals
                    </Text>
                    <Button
                        component={Link}
                        href="/log"
                        mt={6}
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
        <Flex wrap="wrap" gap={12}>
            {/* Hero banner */}
            <Paper
                radius={28}
                px={34}
                py={32}
                shadow="none"
                withBorder={false}
                c="#fff"
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
                    style={{ right: -80, top: -120, borderRadius: 999 }}
                />
                <Grid gap={32} align="flex-end" pos="relative">
                    <Grid.Col span={{ base: 12, md: 7 }}>
                        <Text fz={13} fw={600} opacity={0.85}>
                            Your biggest pattern this week
                        </Text>
                        <Text
                            fz={{ base: 30, sm: 38 }}
                            fw={700}
                            lh={1.08}
                            mt={8}
                            style={{
                                letterSpacing: "-0.04em",
                                textWrap: "balance",
                            }}
                        >
                            {hero.headline}
                        </Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 5 }}>
                        <SimpleGrid cols={3} spacing={10}>
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
                    <Group gap={12} wrap="nowrap">
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
                <Text fz={12} c="var(--tx3)" mt={2}>
                    Average digestion score after eating
                </Text>
                {digestCorr.length === 0 ? (
                    <Text fz={13} c="var(--tx3)" ta="center" py={24}>
                        Rate digestion on a few meals to see this.
                    </Text>
                ) : (
                    <SimpleGrid cols={2} spacing={8} mt={16}>
                        {digestCorr.map((d) => {
                            const tone = scoreTone(d.avgDigestion);
                            return (
                                <Paper
                                    key={d.food}
                                    radius={16}
                                    px={14}
                                    py={12}
                                    bg="var(--sf2)"
                                    shadow="none"
                                    withBorder={false}
                                    style={{ transition: "transform 150ms" }}
                                >
                                    <Group
                                        justify="space-between"
                                        gap={8}
                                        wrap="nowrap"
                                    >
                                        <Text fw={500} fz={14} truncate="end">
                                            {d.food}
                                        </Text>
                                        <Text
                                            component="span"
                                            h={24}
                                            px={9}
                                            fz={12}
                                            fw={700}
                                            lh="24px"
                                            c={tone}
                                            bg={`color-mix(in srgb, ${tone} 16%, transparent)`}
                                            style={{
                                                borderRadius: 999,
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
                    <Text fz={13} c="var(--tx3)" ta="center" py={24}>
                        Log meals with mood/energy to see rankings.
                    </Text>
                ) : (
                    <Stack gap={6} mt={14}>
                        {favorites.map((f, i) => {
                            const first = i === 0;
                            return (
                                <Group
                                    key={f.title + i}
                                    gap={12}
                                    p={6}
                                    wrap="nowrap"
                                    style={{
                                        borderRadius: 14,
                                        transition: "background 150ms",
                                    }}
                                >
                                    <Box
                                        w={34}
                                        h={34}
                                        display="flex"
                                        fz={13}
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
                                            borderRadius: 11,
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {i + 1}
                                    </Box>
                                    <Box flex={1} miw={0}>
                                        <Text fw={600} fz={14} truncate="end">
                                            {f.title}
                                        </Text>
                                        <Text
                                            fz={12}
                                            c="var(--tx3)"
                                            tt="capitalize"
                                        >
                                            {f.mealType.toLowerCase()}
                                        </Text>
                                    </Box>
                                    <Text
                                        fw={700}
                                        fz={14}
                                        c="var(--ac)"
                                        style={{
                                            fontVariantNumeric: "tabular-nums",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {f.score.toFixed(1)}
                                        <Text
                                            component="span"
                                            fz={12}
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
                    borderRadius: 24,
                    background: "linear-gradient(135deg, var(--am), var(--ro))",
                    boxShadow: "var(--sh)",
                }}
            >
                <Paper
                    radius={22.5}
                    p={22}
                    h="100%"
                    shadow="none"
                    withBorder={false}
                >
                    <Stack gap={12} h="100%">
                        <ThemeIcon size={38} radius={12} color="amber">
                            <CalendarDays size={18} />
                        </ThemeIcon>
                        <Text {...CARD_TITLE}>Weekly plans</Text>
                        <Text fz={13} c="var(--tx2)" lh={1.5}>
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
