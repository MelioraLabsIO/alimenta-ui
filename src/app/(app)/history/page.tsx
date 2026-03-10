"use client";

import { useState, useMemo } from "react";
import { mealsRepo } from "@/core/meals/mealsRepo";
import { Meal, MealType } from "@/core/types";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Copy, Pencil, Trash2, Eye, UtensilsCrossed } from "lucide-react";

const MEAL_TYPE_COLORS: Record<string, string> = {
  breakfast: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  lunch: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  dinner: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  snack: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  other: "bg-muted text-muted-foreground",
};

function MealDetailDialog({
  meal,
  open,
  onClose,
  onDelete,
  onDuplicate,
}: {
  meal: Meal | null;
  open: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  if (!meal) return null;
  const moodLabel = (v: number) => ["", "Poor", "Fair", "Okay", "Good", "Great"][v] ?? "";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">{meal.title}</DialogTitle>
          <DialogDescription className="text-xs">
            {new Date(meal.date).toLocaleString("en-US", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
              hour: "numeric", minute: "2-digit",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Foods */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Foods</p>
            <div className="space-y-1">
              {meal.foods.map((f) => (
                <div key={f.id} className="flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="flex-1">{f.name}</span>
                  <span className="text-muted-foreground text-xs">{f.quantity} {f.unit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nutrition */}
          {meal.nutrition && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Nutrition</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Cal", value: meal.nutrition.calories, unit: "kcal" },
                  { label: "Protein", value: meal.nutrition.protein, unit: "g" },
                  { label: "Carbs", value: meal.nutrition.carbs, unit: "g" },
                  { label: "Fat", value: meal.nutrition.fat, unit: "g" },
                ].map(({ label, value, unit }) => (
                  <div key={label} className="rounded-lg bg-muted/50 p-2 text-center">
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                    <p className="text-sm font-semibold">{value ?? "—"}</p>
                    <p className="text-[10px] text-muted-foreground">{unit}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metrics */}
          {meal.metrics && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Wellness</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Mood", value: meal.metrics.mood },
                  { label: "Energy", value: meal.metrics.energy },
                  { label: "Digestion", value: meal.metrics.digestion },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg bg-muted/50 p-2 text-center">
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                    <p className="text-sm font-semibold">{value}/5</p>
                    <p className="text-[10px] text-muted-foreground">{moodLabel(value)}</p>
                  </div>
                ))}
              </div>
              {meal.metrics.notes && (
                <p className="text-xs text-muted-foreground mt-2 italic">"{meal.metrics.notes}"</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-border/50">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => { onDuplicate(meal.id); onClose(); }}
            >
              <Copy className="h-3.5 w-3.5" /> Duplicate
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive ml-auto"
              onClick={() => { onDelete(meal.id); onClose(); }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function HistoryPage() {
  const [allMeals, setAllMeals] = useState<Meal[]>(() => mealsRepo.list());
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selected, setSelected] = useState<Meal | null>(null);
  const [loading] = useState(false);

  const filtered = useMemo(() => {
    return allMeals.filter((m) => {
      if (search && !m.title.toLowerCase().includes(search.toLowerCase()) &&
        !m.foods.some((f) => f.name.toLowerCase().includes(search.toLowerCase()))) return false;
      if (typeFilter !== "all" && m.mealType !== typeFilter) return false;
      if (dateFrom && new Date(m.date) < new Date(dateFrom)) return false;
      if (dateTo && new Date(m.date) > new Date(dateTo + "T23:59:59")) return false;
      return true;
    });
  }, [allMeals, search, typeFilter, dateFrom, dateTo]);

  function handleDelete(id: string) {
    mealsRepo.delete(id);
    setAllMeals(mealsRepo.list());
    toast.success("Meal deleted");
  }

  function handleDuplicate(id: string) {
    mealsRepo.duplicate(id);
    setAllMeals(mealsRepo.list());
    toast.success("Meal duplicated");
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Browse and manage all your logged meals.</p>
      </div>

      {/* Filters */}
      <Card className="border-border/50 bg-card/60">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search meals or foods…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36 h-8 text-sm">
                <SelectValue placeholder="Meal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {(["breakfast","lunch","dinner","snack","other"] as MealType[]).map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-36 h-8 text-sm"
              placeholder="From"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-36 h-8 text-sm"
              placeholder="To"
            />
            {(search || typeFilter !== "all" || dateFrom || dateTo) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => { setSearch(""); setTypeFilter("all"); setDateFrom(""); setDateTo(""); }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/50 bg-card/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            {filtered.length} meal{filtered.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
              <UtensilsCrossed className="h-10 w-10 opacity-30" />
              <p className="text-sm">No meals found</p>
              <p className="text-xs">Try adjusting your filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-xs">Meal</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Calories</TableHead>
                  <TableHead className="text-xs">Mood</TableHead>
                  <TableHead className="text-xs w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((meal) => (
                  <TableRow
                    key={meal.id}
                    className="border-border/50 cursor-pointer hover:bg-muted/30"
                    onClick={() => setSelected(meal)}
                  >
                    <TableCell className="font-medium text-sm py-3">{meal.title}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] capitalize ${MEAL_TYPE_COLORS[meal.mealType]}`}
                      >
                        {meal.mealType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(meal.date).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {meal.nutrition?.calories ? `${meal.nutrition.calories} kcal` : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {meal.metrics ? `${meal.metrics.mood}/5` : "—"}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => setSelected(meal)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => handleDuplicate(meal.id)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(meal.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <MealDetailDialog
        meal={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
      />
    </div>
  );
}
