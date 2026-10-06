"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
    ActionIcon,
    Anchor,
    Box,
    Card,
    Flex,
    Group,
    Paper,
    SimpleGrid,
    Skeleton,
    Stack,
    Text,
    ThemeIcon,
    Tooltip,
    UnstyledButton,
} from "@mantine/core";
import {
    Apple,
    ArrowRight,
    Copy,
    Eye,
    Moon,
    Pencil,
    Plus,
    Sparkles,
    Sun,
    Sunrise,
    TrendingUp,
    Utensils,
    Zap,
    type LucideIcon,
} from "lucide-react";
import { mealsRepo } from "@/apis/meal/mealsRepo";
import { getTopFood } from "@/apis/insights/queries";
import { getRecentMeals } from "@/apis/meal/queries";
import { CaloriesChart } from "@/components/charts/calories-chart";
import { MacrosChart } from "@/components/charts/macros-chart";
import { MoodScatterChart } from "@/components/charts/mood-scatter-chart";
import { LogMealDialog } from "@/components/meals/log-meal-dialog";
import { toast } from "@/lib/notifications";
import { EMealType, Meal } from "@/core/types/models/meal";

const MEAL_TYPE_META: Record<
    EMealType,
    { label: string; color: string; Icon: LucideIcon }
> = {
    [EMealType.BREAKFAST]: {
        label: "Breakfast",
        color: "amber",
        Icon: Sunrise,
    },
    [EMealType.LUNCH]: { label: "Lunch", color: "alimenta", Icon: Sun },
    [EMealType.DINNER]: { label: "Dinner", color: "sky", Icon: Moon },
    [EMealType.SNACK]: { label: "Snack", color: "rose", Icon: Apple },
    [EMealType.OTHER]: { label: "Other", color: "gray", Icon: Utensils },
};

const TABULAR = { fontVariantNumeric: "tabular-nums" } as const;

function isSameDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function MealRow({
    meal,
    onDuplicate,
}: {
    meal: Meal;
    onDuplicate: (id: string) => void;
}) {
    const meta = MEAL_TYPE_META[meal.type] ?? MEAL_TYPE_META[EMealType.OTHER];
    const { Icon } = meta;
    const time = meal.mealTime
        ? new Date(meal.mealTime).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
          })
        : null;
    const kcal = meal.nutrition?.calories
        ? `${Math.round(meal.nutrition.calories)} kcal`
        : "";

    return (
        <Box
            p={12}
            style={{
                borderRadius: 16,
                border: "1px solid var(--bd2)",
                background: "var(--sf)",
            }}
        >
            <Group gap={12} wrap="nowrap">
                <ThemeIcon size={40} radius={13} color={meta.color}>
                    <Icon size={17} />
                </ThemeIcon>
                <Box flex={1} miw={0}>
                    <Text fz={12} c="var(--tx3)" truncate="end">
                        {meta.label}
                        {time ? ` · ${time}` : ""}
                    </Text>
                    <Text fw={600} mt={2} truncate="end">
                        {meal.title}
                    </Text>
                </Box>
                {kcal && (
                    <Text
                        fz={13}
                        c="var(--tx2)"
                        style={{ ...TABULAR, whiteSpace: "nowrap" }}
                    >
                        {kcal}
                    </Text>
                )}
                <Group gap={2} wrap="nowrap">
                    <Tooltip label="View in history">
                        <ActionIcon
                            component={Link}
                            href="/history"
                            variant="subtle"
                            size={30}
                            aria-label="View in history"
                        >
                            <Eye size={14} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Duplicate">
                        <ActionIcon
                            variant="subtle"
                            size={30}
                            aria-label="Duplicate meal"
                            onClick={() => onDuplicate(meal.id)}
                        >
                            <Copy size={14} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Edit">
                        <ActionIcon
                            component={Link}
                            href="/log"
                            variant="subtle"
                            size={30}
                            aria-label="Edit meal"
                        >
                            <Pencil size={14} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Group>
        </Box>
    );
}

function StatTile({
    icon,
    color,
    label,
    value,
    sub,
}: {
    icon: LucideIcon;
    color: string;
    label: string;
    value: string;
    sub?: string;
}) {
    const Icon = icon;
    return (
        <Paper
            radius={16}
            p={12}
            bg="var(--sf2)"
            shadow="none"
            withBorder={false}
            miw={0}
        >
            <Group gap={6} wrap="nowrap">
                <ThemeIcon size={22} radius={7} color={color}>
                    <Icon size={12} />
                </ThemeIcon>
                <Text fz={11} c="var(--tx3)" truncate="end">
                    {label}
                </Text>
            </Group>
            <Text
                fz={18}
                fw={700}
                lh={1.1}
                mt={8}
                truncate="end"
                style={{ letterSpacing: "-0.02em", ...TABULAR }}
            >
                {value}
            </Text>
            <Text fz={11} c="var(--tx3)" mt={2} truncate="end" mih={16}>
                {sub ?? ""}
            </Text>
        </Paper>
    );
}

export default function DashboardPage() {
    const meals = useMemo(() => mealsRepo.list(), []);
    const { data: recentMeals = [], isPending: recentMealsPending } = useQuery<
        Meal[]
    >({
        queryKey: ["recent-meals"],
        queryFn: () => getRecentMeals(),
    });
    const weeklyCalories = useMemo(() => mealsRepo.weeklyCalories(), []);
    const weeklyMacros = useMemo(() => mealsRepo.weeklyMacros(), []);
    const moodData = useMemo(() => mealsRepo.moodEnergyData(), []);
    const { data: topFoodData } = useQuery({
        queryKey: ["top-food"],
        queryFn: getTopFood,
    });

    const thisWeekMeals = useMemo(() => {
        const from = new Date();
        from.setDate(from.getDate() - 6);
        from.setHours(0, 0, 0, 0);
        return meals.filter((m) => m.mealTime && new Date(m.mealTime) >= from);
    }, [meals]);

    const todayMeals = useMemo(() => {
        const now = new Date();
        return meals.filter(
            (m) => m.mealTime && isSameDay(new Date(m.mealTime), now)
        );
    }, [meals]);

    const todayCalories = useMemo(
        () =>
            Math.round(
                todayMeals.reduce(
                    (sum, m) => sum + (m.nutrition?.calories ?? 0),
                    0
                )
            ),
        [todayMeals]
    );

    const weekTotal = useMemo(
        () => Math.round(weeklyCalories.reduce((s, d) => s + d.calories, 0)),
        [weeklyCalories]
    );

    const avgCalories = useMemo(() => {
        const days = weeklyCalories.filter((d) => d.calories > 0);
        if (!days.length) return 0;
        return Math.round(
            days.reduce((s, d) => s + d.calories, 0) / days.length
        );
    }, [weeklyCalories]);

    const streak = useMemo(() => {
        let count = 0;
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const hasMeal = meals.some((m) => {
                const md = m.mealTime ? new Date(m.mealTime) : null;
                return (
                    md &&
                    md.getFullYear() === d.getFullYear() &&
                    md.getMonth() === d.getMonth() &&
                    md.getDate() === d.getDate()
                );
            });
            if (hasMeal) count++;
            else break;
        }
        return count;
    }, [meals]);

    function handleDuplicate(id: string) {
        mealsRepo.duplicate(id);
        toast.success("Meal duplicated!");
    }

    return (
        <Flex wrap="wrap" gap={12} maw={1152} mx="auto">
            {/* ---------------------------------------------------- Today */}
            <Card
                style={{
                    flex: "5 1 360px",
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Group justify="space-between" align="center">
                    <Text fw={700} fz={17} lts="-0.01em">
                        Today
                    </Text>
                    <Text fz={12} c="var(--tx3)">
                        {todayMeals.length} of 3 meals
                    </Text>
                </Group>

                <Box mt={20} mb={22}>
                    <MacrosChart data={weeklyMacros} label="This week">
                        <Box>
                            <Text
                                fz={36}
                                fw={700}
                                lh={1}
                                style={{ letterSpacing: "-0.04em", ...TABULAR }}
                            >
                                {todayCalories.toLocaleString()}
                                <Text
                                    component="span"
                                    fz={14}
                                    fw={500}
                                    c="var(--tx3)"
                                    ml={5}
                                    style={{ letterSpacing: 0 }}
                                >
                                    kcal
                                </Text>
                            </Text>
                            <Text fz={12} c="var(--tx3)" mt={6}>
                                vs.{" "}
                                {avgCalories
                                    ? avgCalories.toLocaleString()
                                    : "—"}{" "}
                                daily average
                            </Text>
                        </Box>
                    </MacrosChart>
                </Box>

                <SimpleGrid cols={3} spacing={8}>
                    <StatTile
                        icon={Utensils}
                        color="alimenta"
                        label="Meals this week"
                        value={String(thisWeekMeals.length)}
                        sub="logged"
                    />
                    <StatTile
                        icon={Zap}
                        color="amber"
                        label="Streak"
                        value={`${streak}d`}
                        sub="consecutive days"
                    />
                    <StatTile
                        icon={TrendingUp}
                        color="sky"
                        label="Top food"
                        value={topFoodData?.title ?? "—"}
                        sub={
                            topFoodData?.foodCount
                                ? `${topFoodData.foodCount} times`
                                : undefined
                        }
                    />
                </SimpleGrid>

                <Stack gap={8} mt={22} flex={1}>
                    <Group justify="space-between" align="baseline">
                        <Text fz={12} fw={600} c="var(--tx3)">
                            Recent meals
                        </Text>
                        <Anchor
                            component={Link}
                            href="/history"
                            fz={12}
                            fw={600}
                            c="var(--ac)"
                        >
                            View all
                        </Anchor>
                    </Group>

                    {recentMealsPending
                        ? [0, 1, 2].map((i) => (
                              <Skeleton key={i} h={66} radius={16} />
                          ))
                        : recentMeals.map((meal) => (
                              <MealRow
                                  key={meal.id}
                                  meal={meal}
                                  onDuplicate={handleDuplicate}
                              />
                          ))}

                    <LogMealDialog
                        renderTrigger={(open) => (
                            <UnstyledButton
                                onClick={open}
                                w="100%"
                                p={12}
                                style={{
                                    borderRadius: 16,
                                    border: "1px dashed var(--bd2)",
                                    transition:
                                        "transform 160ms, background 160ms",
                                }}
                            >
                                <Group gap={12} wrap="nowrap">
                                    <ThemeIcon
                                        size={40}
                                        radius={13}
                                        color="gray"
                                        style={{
                                            backgroundColor: "var(--sf2)",
                                            color: "var(--tx3)",
                                        }}
                                    >
                                        <Plus size={17} />
                                    </ThemeIcon>
                                    <Box flex={1} miw={0}>
                                        <Text fz={12} c="var(--tx3)">
                                            {recentMeals.length
                                                ? "Next meal · not logged yet"
                                                : "Nothing logged yet"}
                                        </Text>
                                        <Text fw={600} mt={2} c="var(--tx2)">
                                            {recentMeals.length
                                                ? "Add a meal"
                                                : "Log your first meal"}
                                        </Text>
                                    </Box>
                                </Group>
                            </UnstyledButton>
                        )}
                    />
                </Stack>
            </Card>

            {/* ------------------------------------------------ Right column */}
            <Stack gap={12} style={{ flex: "7 1 440px", minWidth: 0 }}>
                <Card
                    style={{
                        flex: 1,
                        minHeight: 300,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Group justify="space-between" align="baseline">
                        <Text fw={700} fz={17} lts="-0.01em">
                            This week
                        </Text>
                        <Text fz={12} c="var(--tx3)" style={TABULAR}>
                            {weekTotal.toLocaleString()} kcal total
                        </Text>
                    </Group>
                    <Box mt={18} flex={1}>
                        <CaloriesChart data={weeklyCalories} />
                    </Box>
                </Card>

                <Flex wrap="wrap" gap={12}>
                    <Card
                        p={20}
                        style={{
                            flex: "4 1 260px",
                            minWidth: 0,
                            minHeight: 220,
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Text fw={700} fz={16}>
                            Mood by meal
                        </Text>
                        <Text fz={12} c="var(--tx3)" mt={2}>
                            Stronger green means a better mood
                        </Text>
                        <MoodScatterChart data={moodData} />
                    </Card>

                    <Box
                        p={1}
                        style={{
                            flex: "3 1 220px",
                            minWidth: 0,
                            borderRadius: 24,
                            background: "var(--gradient-accent)",
                            boxShadow: "var(--sh)",
                        }}
                    >
                        <UnstyledButton
                            component={Link}
                            href="/insights"
                            w="100%"
                            h="100%"
                            p={20}
                            style={{
                                borderRadius: 23,
                                background: "var(--sf)",
                                display: "flex",
                                flexDirection: "column",
                                gap: 12,
                            }}
                        >
                            <ThemeIcon>
                                <Sparkles size={16} />
                            </ThemeIcon>
                            <Text fz={12} fw={600} c="var(--tx3)">
                                Weekly insight
                            </Text>
                            <Text
                                fw={700}
                                fz={16}
                                lh={1.3}
                                style={{
                                    letterSpacing: "-0.015em",
                                    textWrap: "pretty",
                                }}
                            >
                                Your highest energy days this week followed
                                meals rich in protein and complex carbs — like
                                your Salmon & Roasted Veggies and Oatmeal with
                                Banana.
                            </Text>
                            <Text fz={12} c="var(--tx2)" lh={1.5}>
                                Consider making these a regular part of your
                                routine.
                            </Text>
                            <Group gap={4} mt="auto" wrap="nowrap">
                                <Text fz={12} fw={600} c="var(--ac)">
                                    See insights
                                </Text>
                                <ArrowRight size={13} color="var(--ac)" />
                            </Group>
                        </UnstyledButton>
                    </Box>
                </Flex>
            </Stack>
        </Flex>
    );
}
