"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { mealsRepo } from "@/apis/meal/mealsRepo";
import { getTopFood } from "@/apis/insights/queries";
import { getRecentMeals } from "@/apis/meal/queries";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/mantine/ui";
import { Badge } from "@/components/mantine/ui";
import { Button } from "@/components/mantine/ui";
import { CaloriesChart } from "@/components/charts/calories-chart";
import { MacrosChart } from "@/components/charts/macros-chart";
import { MoodScatterChart } from "@/components/charts/mood-scatter-chart";
import {
    Flame,
    Utensils,
    TrendingUp,
    Zap,
    Copy,
    Pencil,
    Eye,
    Sparkles,
    ArrowUpRight,
} from "lucide-react";
import { toast } from "@/lib/notifications";
import { Meal } from "@/core/types/models/meal";
import { LogMealDialog } from "@/components/meals/log-meal-dialog";

const MEAL_TYPE_COLORS: Record<string, string> = {
    Breakfast: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Lunch: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Dinner: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Snack: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    Other: "bg-muted text-muted-foreground",
};

function MealRow({
    meal,
    onDuplicate,
}: {
    meal: Meal;
    onDuplicate: (id: string) => void;
}) {
    return (
        <div className="flex items-center gap-3 py-3">
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{meal.title}</p>
                <p className="text-xs text-muted-foreground">
                    {meal.mealTime &&
                        new Date(meal.mealTime).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                        })}
                    {meal.nutrition?.calories
                        ? ` · ${Math.round(meal.nutrition.calories)} kcal`
                        : ""}
                </p>
            </div>
            <Badge
                variant="outline"
                className={`text-[10px] capitalize shrink-0 ${MEAL_TYPE_COLORS[meal.type]}`}
            >
                {meal.type}
            </Badge>
            <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                    <Link href="/history">
                        <Eye className="h-3.5 w-3.5" />
                    </Link>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onDuplicate(meal.id)}
                >
                    <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                    <Link href="/log">
                        <Pencil className="h-3.5 w-3.5" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const meals = useMemo(() => mealsRepo.list(), []);
    const { data: recentMeals = [] } = useQuery({
        queryKey: ["recent-meals"],
        queryFn: getRecentMeals,
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
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="dashboard-hero flex flex-col gap-5 rounded-2xl border border-border/50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        <Sparkles className="h-3.5 w-3.5" />
                        Today&apos;s overview
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                        })}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <LogMealDialog />
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: "Meals this week",
                        value: thisWeekMeals.length,
                        icon: <Utensils className="h-4 w-4 text-emerald-400" />,
                        sub: "logged",
                        accent: "from-emerald-400/28 to-teal-500/10",
                        ring: "bg-emerald-400/12",
                    },
                    {
                        label: "Avg calories/day",
                        value: avgCalories ? `${avgCalories}` : "—",
                        icon: <Flame className="h-4 w-4 text-orange-400" />,
                        sub: "kcal",
                        accent: "from-orange-400/24 to-rose-500/10",
                        ring: "bg-orange-400/12",
                    },
                    {
                        label: "Top food",
                        value: topFoodData?.title ?? "—",
                        icon: <TrendingUp className="h-4 w-4 text-blue-400" />,
                        sub: topFoodData?.foodCount
                            ? `${topFoodData.foodCount} times`
                            : "",
                        accent: "from-blue-400/24 to-cyan-500/10",
                        ring: "bg-blue-400/12",
                    },
                    {
                        label: "Streak",
                        value: `${streak}d`,
                        icon: <Zap className="h-4 w-4 text-yellow-400" />,
                        sub: "consecutive days",
                        accent: "from-yellow-400/24 to-amber-500/10",
                        ring: "bg-yellow-400/12",
                    },
                ].map((kpi) => (
                    <Card
                        key={kpi.label}
                        className="kpi-card overflow-hidden border-border/50 bg-card/60"
                    >
                        <div
                            className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r ${kpi.accent}`}
                        />
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-muted-foreground">
                                    {kpi.label}
                                </span>
                                <div
                                    className={`w-8 h-8 rounded-lg ${kpi.ring} flex items-center justify-center`}
                                >
                                    {kpi.icon}
                                </div>
                            </div>
                            <p className="text-2xl font-bold tracking-tight truncate">
                                {kpi.value}
                            </p>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                {kpi.sub}
                                <ArrowUpRight className="h-3 w-3 opacity-50" />
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2 border-border/50 bg-card/60">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">
                            Weekly Calories
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CaloriesChart data={weeklyCalories} />
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/60">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">
                            Macro Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MacrosChart data={weeklyMacros} />
                    </CardContent>
                </Card>
            </div>

            {/* Mood scatter + recent meals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="border-border/50 bg-card/60">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">
                            Mood vs Energy
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MoodScatterChart data={moodData} />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 border-border/50 bg-card/60">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-semibold">
                            Recent Meals
                        </CardTitle>
                        <Link href="/history">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7"
                            >
                                View all
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {recentMeals.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                No meals logged yet.{" "}
                                <Link
                                    href="/log"
                                    className="text-primary underline"
                                >
                                    Log your first meal
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/50">
                                {recentMeals.map((meal) => (
                                    <MealRow
                                        key={meal.id}
                                        meal={meal}
                                        onDuplicate={handleDuplicate}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Insight highlight */}
            <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 to-teal-950/20">
                <CardContent className="p-5 flex gap-4 items-start">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-emerald-300 mb-1">
                            Weekly Insight
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Your highest energy days this week followed meals
                            rich in protein and complex carbs — like your{" "}
                            <span className="text-foreground font-medium">
                                Salmon & Roasted Veggies
                            </span>{" "}
                            and{" "}
                            <span className="text-foreground font-medium">
                                Oatmeal with Banana
                            </span>
                            . Consider making these a regular part of your
                            routine.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
