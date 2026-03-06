"use client";

import { useMemo } from "react";
import Link from "next/link";
import { mealsRepo } from "@/core/meals/mealsRepo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";
import { toast } from "sonner";
import { Meal } from "@/core/types";

const MEAL_TYPE_COLORS: Record<string, string> = {
  breakfast: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  lunch: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  dinner: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  snack: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  other: "bg-muted text-muted-foreground",
};

function MealRow({ meal, onDuplicate }: { meal: Meal; onDuplicate: (id: string) => void }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{meal.title}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(meal.date).toLocaleString("en-US", {
            month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
          })}
          {meal.nutrition?.calories ? ` · ${meal.nutrition.calories} kcal` : ""}
        </p>
      </div>
      <Badge
        variant="outline"
        className={`text-[10px] capitalize shrink-0 ${MEAL_TYPE_COLORS[meal.mealType]}`}
      >
        {meal.mealType}
      </Badge>
      <div className="flex gap-1 shrink-0">
        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
          <Link href={`/app/history`}><Eye className="h-3.5 w-3.5" /></Link>
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
          <Link href={`/app/log`}><Pencil className="h-3.5 w-3.5" /></Link>
        </Button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const meals = useMemo(() => mealsRepo.list(), []);
  const weeklyCalories = useMemo(() => mealsRepo.weeklyCalories(), []);
  const weeklyMacros = useMemo(() => mealsRepo.weeklyMacros(), []);
  const moodData = useMemo(() => mealsRepo.moodEnergyData(), []);
  const topFoods = useMemo(() => mealsRepo.topFoods(3), []);

  const thisWeekMeals = useMemo(() => {
    const from = new Date();
    from.setDate(from.getDate() - 6);
    from.setHours(0, 0, 0, 0);
    return meals.filter((m) => new Date(m.date) >= from);
  }, [meals]);

  const avgCalories = useMemo(() => {
    const days = weeklyCalories.filter((d) => d.calories > 0);
    if (!days.length) return 0;
    return Math.round(days.reduce((s, d) => s + d.calories, 0) / days.length);
  }, [weeklyCalories]);

  const streak = useMemo(() => {
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const hasMeal = meals.some((m) => {
        const md = new Date(m.date);
        return md.getFullYear() === d.getFullYear() &&
          md.getMonth() === d.getMonth() &&
          md.getDate() === d.getDate();
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

  const recentMeals = meals.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <Link href="/app/log">
          <Button className="gap-2">
            <Utensils className="h-4 w-4" /> Log Meal
          </Button>
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Meals this week",
            value: thisWeekMeals.length,
            icon: <Utensils className="h-4 w-4 text-emerald-400" />,
            sub: "logged",
          },
          {
            label: "Avg calories/day",
            value: avgCalories ? `${avgCalories}` : "—",
            icon: <Flame className="h-4 w-4 text-orange-400" />,
            sub: "kcal",
          },
          {
            label: "Top food",
            value: topFoods[0]?.food ?? "—",
            icon: <TrendingUp className="h-4 w-4 text-blue-400" />,
            sub: topFoods[0] ? `${topFoods[0].count}× logged` : "",
          },
          {
            label: "Streak",
            value: `${streak}d`,
            icon: <Zap className="h-4 w-4 text-yellow-400" />,
            sub: "consecutive days",
          },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-border/50 bg-card/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
                <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center">
                  {kpi.icon}
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight truncate">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-border/50 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Weekly Calories</CardTitle>
          </CardHeader>
          <CardContent>
            <CaloriesChart data={weeklyCalories} />
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Macro Breakdown</CardTitle>
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
            <CardTitle className="text-sm font-semibold">Mood vs Energy</CardTitle>
          </CardHeader>
          <CardContent>
            <MoodScatterChart data={moodData} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border/50 bg-card/60">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Recent Meals</CardTitle>
            <Link href="/app/history">
              <Button variant="ghost" size="sm" className="text-xs h-7">View all</Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {recentMeals.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No meals logged yet.{" "}
                <Link href="/app/log" className="text-primary underline">Log your first meal</Link>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {recentMeals.map((meal) => (
                  <MealRow key={meal.id} meal={meal} onDuplicate={handleDuplicate} />
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
            <p className="text-sm font-semibold text-emerald-300 mb-1">Weekly Insight</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your highest energy days this week followed meals rich in protein and complex carbs —
              like your <span className="text-foreground font-medium">Salmon & Roasted Veggies</span> and{" "}
              <span className="text-foreground font-medium">Oatmeal with Banana</span>.
              Consider making these a regular part of your routine.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
