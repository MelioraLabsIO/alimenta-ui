"use client";

import { useMemo } from "react";
import { mealsRepo } from "@/core/meals/mealsRepo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TopFoodsChart } from "@/components/charts/top-foods-chart";
import { MoodTrendChart } from "@/components/charts/mood-trend-chart";
import { CalendarDays, Sparkles, Trophy, Leaf } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function InsightsPage() {
  const topFoods = useMemo(() => mealsRepo.topFoods(8), []);
  const moodTrend = useMemo(() => mealsRepo.moodTrend(), []);
  const digestCorr = useMemo(() => mealsRepo.digestCorrelation(6), []);
  const meals = useMemo(() => mealsRepo.list(), []);

  // Favorites: meals with highest avg mood+energy
  const favorites = useMemo(() => {
    return meals
      .filter((m) => m.metrics)
      .map((m) => ({
        title: m.title,
        score: ((m.metrics!.mood + m.metrics!.energy) / 2),
        mealType: m.mealType,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [meals]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Patterns and correlations from your meal history.
        </p>
      </div>

      {/* Top row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/50 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Leaf className="h-4 w-4 text-emerald-400" />
              Most Frequent Foods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TopFoodsChart data={topFoods} />
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-400" />
              Mood & Energy Trend (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MoodTrendChart data={moodTrend} />
          </CardContent>
        </Card>
      </div>

      {/* Digestion correlation */}
      <Card className="border-border/50 bg-card/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Leaf className="h-4 w-4 text-teal-400" />
            Foods Correlated with Good Digestion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={digestCorr}
              margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis
                dataKey="food"
                tick={{ fontSize: 11, fill: "#a1a1aa" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 5]}
                tick={{ fontSize: 11, fill: "#a1a1aa" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                  fontSize: 12,
                  color: "#f4f4f5",
                }}
                labelStyle={{ color: "#f4f4f5" }}
                itemStyle={{ color: "#f4f4f5" }}
                formatter={(v: number | undefined, _name: string | undefined) => [v != null ? v.toFixed(1) : "—", "Avg Digestion"]}
              />
              <Bar dataKey="avgDigestion" radius={[4, 4, 0, 0]}>
                {digestCorr.map((_, i) => (
                  <Cell
                    key={i}
                    fill={`hsl(${160 + i * 8}, 60%, ${55 - i * 3}%)`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Favorites ranking + Coming soon */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/50 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-400" />
              Top Rated Meals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {favorites.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Log meals with mood/energy to see rankings.
              </p>
            ) : (
              <div className="space-y-2">
                {favorites.map((f, i) => (
                  <div key={f.title + i} className="flex items-center gap-3 py-2">
                    <span className="text-sm font-bold text-muted-foreground w-5 shrink-0">
                      #{i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{f.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{f.mealType}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-sm font-semibold text-emerald-400">
                        {f.score.toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">/5</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coming soon: Weekly plan generator */}
        <Card className="border-dashed border-border/50 bg-card/30">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3 h-full min-h-48">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold">Weekly Plan Generator</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Automatically generate a personalized weekly meal plan based on your preferences and history.
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
