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
            p="md"
            style={{
                borderRadius: "var(--mantine-radius-lg)",
                border: "1px solid var(--bd2)",
                background: "var(--sf)",
            }}
        >
            <Group gap="md" wrap="nowrap">
                <ThemeIcon size={40} radius="md" color={meta.color}>
                    <Icon size={17} />
                </ThemeIcon>
                <Box flex={1} miw={0}>
                    <Text fz="xs" c="var(--tx3)" truncate="end">
                        {meta.label}
                        {time ? ` · ${time}` : ""}
                    </Text>
                    <Text fw={600} mt="xxs" truncate="end">
                        {meal.title}
                    </Text>
                </Box>
                {kcal && (
                    <Text
                        fz="sm"
                        c="var(--tx2)"
                        style={{ ...TABULAR, whiteSpace: "nowrap" }}
                    >
                        {kcal}
                    </Text>
                )}
                <Group gap="xxs" wrap="nowrap">
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
            radius="lg"
            p="md"
            bg="var(--sf2)"
            shadow="none"
            withBorder={false}
            miw={0}
        >
            <Group gap="xs" wrap="nowrap">
                <ThemeIcon size={22} radius="xs" color={color}>
                    <Icon size={12} />
                </ThemeIcon>
                <Text fz="xxs" c="var(--tx3)" truncate="end">
                    {label}
                </Text>
            </Group>
            <Text
                fz="xl"
                fw={700}
                lh="xs"
                mt="sm"
                truncate="end"
                style={{ letterSpacing: "var(--ls-snug)", ...TABULAR }}
            >
                {value}
            </Text>
            <Text fz="xxs" c="var(--tx3)" mt="xxs" truncate="end" mih={16}>
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
        <Flex wrap="wrap" gap="md" maw={1152} mx="auto">
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
                    <Text fw={700} fz="xl" lts="-0.01em">
                        Today
                    </Text>
                    <Text fz="xs" c="var(--tx3)">
                        {todayMeals.length} of 3 meals
                    </Text>
                </Group>

                <Box mt="xl" mb="xl">
                    <MacrosChart data={weeklyMacros} label="This week">
                        <Box>
                            <Text
                                fz="display"
                                fw={700}
                                lh={1}
                                style={{
                                    letterSpacing: "var(--ls-snug)",
                                    ...TABULAR,
                                }}
                            >
                                {todayCalories.toLocaleString()}
                                <Text
                                    component="span"
                                    fz="md"
                                    fw={500}
                                    c="var(--tx3)"
                                    ml="xs"
                                    style={{ letterSpacing: 0 }}
                                >
                                    kcal
                                </Text>
                            </Text>
                            <Text fz="xs" c="var(--tx3)" mt="xs">
                                vs.{" "}
                                {avgCalories
                                    ? avgCalories.toLocaleString()
                                    : "—"}{" "}
                                daily average
                            </Text>
                        </Box>
                    </MacrosChart>
                </Box>

                <SimpleGrid cols={3} spacing="sm">
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

                <Stack gap="sm" mt="xl" flex={1}>
                    <Group justify="space-between" align="baseline">
                        <Text fz="xs" fw={600} c="var(--tx3)">
                            Recent meals
                        </Text>
                        <Anchor
                            component={Link}
                            href="/history"
                            fz="xs"
                            fw={600}
                            c="var(--ac)"
                        >
                            View all
                        </Anchor>
                    </Group>

                    {recentMealsPending
                        ? [0, 1, 2].map((i) => (
                              <Skeleton key={i} h={66} radius="lg" />
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
                                p="md"
                                style={{
                                    borderRadius: "var(--mantine-radius-lg)",
                                    border: "1px dashed var(--bd2)",
                                    transition: `transform var(--motion-normal), background var(--motion-normal)`,
                                }}
                            >
                                <Group gap="md" wrap="nowrap">
                                    <ThemeIcon
                                        size={40}
                                        radius="md"
                                        color="gray"
                                        style={{
                                            backgroundColor: "var(--sf2)",
                                            color: "var(--tx3)",
                                        }}
                                    >
                                        <Plus size={17} />
                                    </ThemeIcon>
                                    <Box flex={1} miw={0}>
                                        <Text fz="xs" c="var(--tx3)">
                                            {recentMeals.length
                                                ? "Next meal · not logged yet"
                                                : "Nothing logged yet"}
                                        </Text>
                                        <Text fw={600} mt="xxs" c="var(--tx2)">
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
            <Stack gap="md" style={{ flex: "7 1 440px", minWidth: 0 }}>
                <Card
                    style={{
                        flex: 1,
                        minHeight: 300,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Group justify="space-between" align="baseline">
                        <Text fw={700} fz="xl" lts="-0.01em">
                            This week
                        </Text>
                        <Text fz="xs" c="var(--tx3)" style={TABULAR}>
                            {weekTotal.toLocaleString()} kcal total
                        </Text>
                    </Group>
                    <Box mt="lg" flex={1}>
                        <CaloriesChart data={weeklyCalories} />
                    </Box>
                </Card>

                <Flex wrap="wrap" gap="md">
                    <Card
                        p="xl"
                        style={{
                            flex: "4 1 260px",
                            minWidth: 0,
                            minHeight: 220,
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Text fw={700} fz="lg">
                            Mood by meal
                        </Text>
                        <Text fz="xs" c="var(--tx3)" mt="xxs">
                            Stronger green means a better mood
                        </Text>
                        <MoodScatterChart data={moodData} />
                    </Card>

                    <Box
                        p={1}
                        style={{
                            flex: "3 1 220px",
                            minWidth: 0,
                            borderRadius: "var(--mantine-radius-xl)",
                            background: "var(--gradient-accent)",
                            boxShadow: "var(--sh)",
                        }}
                    >
                        <UnstyledButton
                            component={Link}
                            href="/insights"
                            w="100%"
                            h="100%"
                            p="xl"
                            style={{
                                borderRadius:
                                    "calc(var(--mantine-radius-xl) - 1px)",
                                background: "var(--sf)",
                                display: "flex",
                                flexDirection: "column",
                                gap: "var(--mantine-spacing-md)",
                            }}
                        >
                            <ThemeIcon>
                                <Sparkles size={16} />
                            </ThemeIcon>
                            <Text fz="xs" fw={600} c="var(--tx3)">
                                Weekly insight
                            </Text>
                            <Text
                                fw={700}
                                fz="lg"
                                lh="sm"
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
                            <Text fz="xs" c="var(--tx2)" lh="lg">
                                Consider making these a regular part of your
                                routine.
                            </Text>
                            <Group gap="xxs" mt="auto" wrap="nowrap">
                                <Text fz="xs" fw={600} c="var(--ac)">
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
