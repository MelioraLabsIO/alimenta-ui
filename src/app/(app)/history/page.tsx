"use client";

import {useMemo, useReducer, useState} from "react";
import {mealsRepo} from "@/core/meals/mealsRepo";
import {Meal, MealType} from "@/core/types";
import {toast} from "sonner";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Skeleton} from "@/components/ui/skeleton";
import {Switch} from "@/components/ui/switch";
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
import {Search, Copy, Eye, Trash2, UtensilsCrossed, Pencil} from "lucide-react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getAllMeals} from "@/services/meal/queries";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {deleteMealById} from "@/services/meal/mutations";

const MEAL_TYPE_COLORS: Record<string, string> = {
    BREAKFAST: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    LUNCH: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    DINNER: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    SNACK: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    OTHER: "bg-muted text-muted-foreground",
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
            return {...state, search: action.payload};
        case "SET_TYPE_FILTER":
            return {...state, typeFilter: action.payload};
        case "SET_DATE_FROM":
            return {...state, dateFrom: action.payload};
        case "SET_DATE_TO":
            return {...state, dateTo: action.payload};
        case "SET_DISPLAY_MODE":
            return {...state, displayMode: action.payload};
        case "RESET_FILTERS":
            return {...state, search: "", typeFilter: "all", dateFrom: "", dateTo: ""};
        default:
            return state;
    }
}

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
                            {meal?.foods?.map((f) => (
                                <div key={f.id} className="flex items-center gap-2 text-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"/>
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
                                    {label: "Cal", value: meal.nutrition.calories, unit: "kcal"},
                                    {label: "Protein", value: meal.nutrition.protein, unit: "g"},
                                    {label: "Carbs", value: meal.nutrition.carbs, unit: "g"},
                                    {label: "Fat", value: meal.nutrition.fat, unit: "g"},
                                ].map(({label, value, unit}) => (
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
                                    {label: "Mood", value: meal.metrics.mood},
                                    {label: "Energy", value: meal.metrics.energy},
                                    {label: "Digestion", value: meal.metrics.digestion},
                                ].map(({label, value}) => (
                                    <div key={label} className="rounded-lg bg-muted/50 p-2 text-center">
                                        <p className="text-[10px] text-muted-foreground">{label}</p>
                                        <p className="text-sm font-semibold">{value}/5</p>
                                        <p className="text-[10px] text-muted-foreground">{moodLabel(value)}</p>
                                    </div>
                                ))}
                            </div>
                            {meal.notes && (
                                <p className="text-xs text-muted-foreground mt-2 italic">&#34;{meal.metrics.notes}&#34;</p>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-border/50">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => {
                                onDuplicate(meal.id);
                                onClose();
                            }}
                        >
                            <Copy className="h-3.5 w-3.5"/> Duplicate
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5">
                            <Pencil className="h-3.5 w-3.5"/> Edit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-destructive hover:text-destructive ml-auto"
                            onClick={() => {
                                onDelete(meal.id);
                                onClose();
                            }}
                        >
                            <Trash2 className="h-3.5 w-3.5"/> Delete
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function HistoryPage() {
    const queryClient = useQueryClient();

    const [allMeals, setAllMeals] = useState<Meal[]>(() => mealsRepo.list());
    const [viewState, dispatch] = useReducer(historyViewReducer, initialHistoryViewState);
    const {search, typeFilter, dateFrom, dateTo, displayMode} = viewState;
    const [selected, setSelected] = useState<Meal | null>(null);

    /********************************************* QUERIES ************************************************/
    const {data, isLoading} = useQuery({
        queryKey: ["meals"],
        queryFn: () => getAllMeals(),
    })

    /********************************************* MUTATIONS ************************************************/
    const {mutate: deleteMeal} = useMutation({
        mutationKey: ["deleteMeal"],
        mutationFn: (id: string) => deleteMealById(id),
        onSuccess: (deletedMeal: Pick<Meal, 'id'>) => {
            toast.success("Meal deleted");
            queryClient.setQueryData(["meals"], (cachedData: Meal[]) => {
                if (!cachedData) return cachedData;

                return cachedData?.filter((meal) => meal.id !== deletedMeal.id)
            });
        },
        onError: (error) => {
            toast.error(error.message);
        }
    })

    console.log("data", data)

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
        () => filtered.flatMap((meal) => meal.foods.map((food) => ({meal, food}))),
        [filtered],
    );
    const tableMaxHeight = `${TABLE_HEADER_HEIGHT_PX + TABLE_MAX_VISIBLE_ROWS * TABLE_ROW_HEIGHT_PX}px`;

    function handleDelete(id: string) {
        deleteMeal(id);
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
                            <Search
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"/>
                            <Input
                                placeholder="Search meals or foods…"
                                value={search}
                                onChange={(e) => dispatch({type: "SET_SEARCH", payload: e.target.value})}
                                className="pl-8 h-8 text-sm"
                            />
                        </div>
                        <Select value={typeFilter}
                                onValueChange={(value) => dispatch({type: "SET_TYPE_FILTER", payload: value})}>
                            <SelectTrigger className="w-36 h-8 text-sm">
                                <SelectValue placeholder="Meal type"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All types</SelectItem>
                                {(["Breakfast", "Lunch", "Dinner", "Snack", "Other"] as MealType[]).map((t) => (
                                    <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => dispatch({type: "SET_DATE_FROM", payload: e.target.value})}
                            className="w-36 h-8 text-sm"
                            placeholder="From"
                        />
                        <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => dispatch({type: "SET_DATE_TO", payload: e.target.value})}
                            className="w-36 h-8 text-sm"
                            placeholder="To"
                        />
                        {(search || typeFilter !== "all" || dateFrom || dateTo) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => dispatch({type: "RESET_FILTERS"})}
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
                    <div
                        className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/60 px-3 py-1.5">
            <span
                className={`text-xs transition-colors ${displayMode === "whole" ? "text-foreground" : "text-muted-foreground"}`}>
              Whole meal
            </span>
                        <Switch
                            aria-label="Toggle display mode"
                            checked={displayMode === "itemized"}
                            onCheckedChange={(checked) =>
                                dispatch({type: "SET_DISPLAY_MODE", payload: checked ? "itemized" : "whole"})
                            }
                        />
                        <span
                            className={`text-xs transition-colors ${displayMode === "itemized" ? "text-foreground" : "text-muted-foreground"}`}>
              Itemized
            </span>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-y-auto overflow-x-auto" style={{maxHeight: tableMaxHeight}}>
                    {isLoading ? (
                        <div className="p-4 space-y-3">
                            {Array.from({length: 5}).map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full"/>
                            ))}
                        </div>
                    ) : (displayMode === "whole" ? filtered.length : itemizedRows.length) === 0 ? (
                        <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
                            <UtensilsCrossed className="h-10 w-10 opacity-30"/>
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
                                    ? data.map((meal) => (
                                        <TableRow key={meal.id} className="border-border/50 hover:bg-muted/30">
                                            <TableCell className="font-medium text-sm py-3">{meal.title}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] capitalize ${MEAL_TYPE_COLORS[meal.type]}`}
                                                >
                                                    {meal.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {new Date(meal.createdAt).toLocaleDateString("en-US", {
                                                    month: "short", day: "numeric", year: "numeric",
                                                })}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {meal.nutrition?.calories ? `${meal.nutrition.calories} kcal` : "—"}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {meal.mood ? `${meal.mood}/5` : "—"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost" size="icon" className="h-7 w-7"
                                                        onClick={() => setSelected(meal)}
                                                    >
                                                        <Eye className="h-3.5 w-3.5"/>
                                                    </Button>
                                                    <Button
                                                        variant="ghost" size="icon" className="h-7 w-7"
                                                        onClick={() => handleDuplicate(meal.id)}
                                                    >
                                                        <Copy className="h-3.5 w-3.5"/>
                                                    </Button>
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                        onClick={() => handleDelete(meal.id)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5"/>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                    : itemizedRows.map(({meal, food}) => (
                                        <TableRow key={`${meal.id}-${food.id}`}
                                                  className="border-border/50 hover:bg-muted/30">
                                            <TableCell className="font-medium text-sm py-3">{meal.title}</TableCell>
                                            <TableCell
                                                className="text-xs text-muted-foreground max-w-[240px] sm:max-w-[320px] break-words">
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
                                                        <Copy className="h-3.5 w-3.5"/>
                                                    </Button>
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                        onClick={() => handleDelete(meal.id)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5"/>
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
