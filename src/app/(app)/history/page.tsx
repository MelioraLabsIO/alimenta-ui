"use client";

import { useMemo, useReducer, useState } from "react";
import { mealsRepo } from "@/core/meals/mealsRepo";
import { Meal, MealType } from "@/core/types";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Copy, Eye, Trash2, UtensilsCrossed } from "lucide-react";

const MEAL_TYPE_COLORS: Record<string, string> = {
  breakfast: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  lunch: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  dinner: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  snack: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  other: "bg-muted text-muted-foreground",
};

const TABLE_MAX_VISIBLE_ROWS = 20;
const TABLE_ROW_HEIGHT_PX = 44;
const TABLE_HEADER_HEIGHT_PX = 44;

type DisplayMode = "whole" | "itemized";

type HistoryViewState = {
  search: string;
  typeFilter: string;
  dateFrom: string;
  dateTo: string;
  displayMode: DisplayMode;
};

type HistoryViewAction =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_TYPE_FILTER"; payload: string }
  | { type: "SET_DATE_FROM"; payload: string }
  | { type: "SET_DATE_TO"; payload: string }
  | { type: "SET_DISPLAY_MODE"; payload: DisplayMode }
  | { type: "RESET_FILTERS" };

const initialHistoryViewState: HistoryViewState = {
  search: "",
  typeFilter: "all",
  dateFrom: "",
  dateTo: "",
  displayMode: "whole",
};

function historyViewReducer(state: HistoryViewState, action: HistoryViewAction): HistoryViewState {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, search: action.payload };
    case "SET_TYPE_FILTER":
      return { ...state, typeFilter: action.payload };
    case "SET_DATE_FROM":
      return { ...state, dateFrom: action.payload };
    case "SET_DATE_TO":
      return { ...state, dateTo: action.payload };
    case "SET_DISPLAY_MODE":
      return { ...state, displayMode: action.payload };
    case "RESET_FILTERS":
      return { ...state, search: "", typeFilter: "all", dateFrom: "", dateTo: "" };
    default:
      return state;
  }
}

export default function HistoryPage() {
  const [allMeals, setAllMeals] = useState<Meal[]>(() => mealsRepo.list());
  const [viewState, dispatch] = useReducer(historyViewReducer, initialHistoryViewState);
  const { search, typeFilter, dateFrom, dateTo, displayMode } = viewState;
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

  const itemizedRows = useMemo(
    () => filtered.flatMap((meal) => meal.foods.map((food) => ({ meal, food }))),
    [filtered],
  );
  const tableMaxHeight = `${TABLE_HEADER_HEIGHT_PX + TABLE_MAX_VISIBLE_ROWS * TABLE_ROW_HEIGHT_PX}px`;

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
                onChange={(e) => dispatch({ type: "SET_SEARCH", payload: e.target.value })}
                className="pl-8 h-8 text-sm"
              />
            </div>
            <Select value={typeFilter} onValueChange={(value) => dispatch({ type: "SET_TYPE_FILTER", payload: value })}>
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
              onChange={(e) => dispatch({ type: "SET_DATE_FROM", payload: e.target.value })}
              className="w-36 h-8 text-sm"
              placeholder="From"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => dispatch({ type: "SET_DATE_TO", payload: e.target.value })}
              className="w-36 h-8 text-sm"
              placeholder="To"
            />
            {(search || typeFilter !== "all" || dateFrom || dateTo) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => dispatch({ type: "RESET_FILTERS" })}
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/50 bg-card/60">
        <CardHeader className="pb-2 flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-sm font-semibold">
            {displayMode === "whole"
              ? `${filtered.length} meal${filtered.length !== 1 ? "s" : ""}`
              : `${itemizedRows.length} item${itemizedRows.length !== 1 ? "s" : ""}`}
          </CardTitle>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/60 px-3 py-1.5">
            <span className={`text-xs transition-colors ${displayMode === "whole" ? "text-foreground" : "text-muted-foreground"}`}>
              Whole meal
            </span>
            <Switch
              aria-label="Toggle display mode"
              checked={displayMode === "itemized"}
              onCheckedChange={(checked) =>
                dispatch({ type: "SET_DISPLAY_MODE", payload: checked ? "itemized" : "whole" })
              }
            />
            <span className={`text-xs transition-colors ${displayMode === "itemized" ? "text-foreground" : "text-muted-foreground"}`}>
              Itemized
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-y-auto overflow-x-auto" style={{ maxHeight: tableMaxHeight }}>
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (displayMode === "whole" ? filtered.length : itemizedRows.length) === 0 ? (
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
                  {displayMode === "itemized" && <TableHead className="text-xs">Food</TableHead>}
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Calories</TableHead>
                  {displayMode === "whole" && <TableHead className="text-xs">Mood</TableHead>}
                  <TableHead className="text-xs w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayMode === "whole"
                  ? filtered.map((meal) => (
                    <TableRow key={meal.id} className="border-border/50 hover:bg-muted/30">
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
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7"
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
                  ))
                  : itemizedRows.map(({ meal, food }) => (
                    <TableRow key={`${meal.id}-${food.id}`} className="border-border/50 hover:bg-muted/30">
                      <TableCell className="font-medium text-sm py-3">{meal.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[240px] sm:max-w-[320px] break-words">
                        {food.name} {food.quantity} {food.unit}
                      </TableCell>
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
                      <TableCell>
                        <div className="flex gap-1">
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
    </div>
  );
}
