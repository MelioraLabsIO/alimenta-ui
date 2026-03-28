"use client";

import {useMemo, useReducer, useState} from "react";
import {mealsRepo} from "@/core/meals/mealsRepo";
import {EMealType, Meal} from "@/core/types";
import {toast} from "sonner";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Skeleton} from "@/components/ui/skeleton";
import {Switch} from "@/components/ui/switch";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Copy, Eye, Pencil, Search, Trash2, UtensilsCrossed} from "lucide-react";
import {Checkbox} from "@/components/ui/checkbox";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getAllMeals} from "@/services/meal/queries";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {BulkDeleteConfirmDialog} from "@/components/meals/bulk-delete-confirm-dialog";
import {deleteMealById, bulkDeleteMeals} from "@/services/meal/mutations";
import {LogMealDialog} from "@/components/meals/log-meal-dialog";

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
                              onEdit,
                          }: {
    meal: Meal | null;
    open: boolean;
    onClose: () => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onEdit: (meal: Meal) => void;
}) {
    if (!meal) return null;
    const mealData = meal as Meal;
    const moodLabel = (v: number) => ["", "Poor", "Fair", "Okay", "Good", "Great"][v] ?? "";

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-base">{mealData.title}</DialogTitle>
                    <DialogDescription className="text-xs">
                        {mealData.foodTime && new Date(mealData.foodTime).toLocaleString("en-US", {
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
                            {((mealData?.items as any) || [])?.map((f: any) => (
                                <div key={f.id} className="flex items-center gap-2 text-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"/>
                                    <span className="flex-1">{f.catalogFood.name}</span>
                                    <span className="text-muted-foreground text-xs">{f.quantity} {f.unit}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Nutrition */}
                    {mealData.nutrition && (
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Nutrition</p>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    {label: "Cal", value: mealData.nutrition.calories, unit: "kcal"},
                                    {label: "Protein", value: mealData.nutrition.protein, unit: "g"},
                                    {label: "Carbs", value: mealData.nutrition.carbs, unit: "g"},
                                    {label: "Fat", value: mealData.nutrition.fat, unit: "g"},
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
                    {mealData && (
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Wellness</p>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    {label: "Mood", value: mealData.mood},
                                    {label: "Energy", value: mealData.energy},
                                    {label: "Digestion", value: mealData.digestion},
                                ].map(({label, value}) => (
                                    <div key={label} className="rounded-lg bg-muted/50 p-2 text-center">
                                        <p className="text-[10px] text-muted-foreground">{label}</p>
                                        <p className="text-sm font-semibold">{value}/5</p>
                                        <p className="text-[10px] text-muted-foreground">{moodLabel(value ?? 0)}</p>
                                    </div>
                                ))}
                            </div>
                            {mealData.notes && (
                                <p className="text-xs text-muted-foreground mt-2 italic">&#34;{mealData.notes}&#34;</p>
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
                                onDuplicate(mealData.id);
                                onClose();
                            }}
                        >
                            <Copy className="h-3.5 w-3.5"/> Duplicate
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
                            onEdit(mealData);
                            onClose();
                        }}>
                            <Pencil className="h-3.5 w-3.5"/> Edit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-destructive hover:text-destructive ml-auto"
                            onClick={() => {
                                onDelete(mealData.id);
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

    const [viewState, dispatch] = useReducer(historyViewReducer, initialHistoryViewState);
    const {search, typeFilter, dateFrom, dateTo, displayMode} = viewState;
    const [selected, setSelected] = useState<Meal | null>(null);
    const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedMealIds, setSelectedMealIds] = useState<Set<string>>(new Set());

    /********************************************* QUERIES ************************************************/
    const {data: allMeals, isLoading} = useQuery({
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

    const {mutate: bulkDelete} = useMutation({
        mutationKey: ["bulkDeleteMeals"],
        mutationFn: (ids: string[]) => bulkDeleteMeals(ids),
        onSuccess: (result: { count: number }) => {
            toast.success(`${result.count} meal${result.count !== 1 ? 's' : ''} deleted`);
            queryClient.setQueryData(["meals"], (cachedData: Meal[]) => {
                if (!cachedData) return cachedData;

                return cachedData?.filter((meal) => !selectedMealIds.has(meal.id))
            });
            setSelectedMealIds(new Set());
        },
        onError: (error) => {
            toast.error(error.message);
        }
    })

    const filtered = useMemo(() => {
        if (!allMeals) return []
        return allMeals.filter((m) => {
            if (search && !m.title.toLowerCase().includes(search.toLowerCase()) &&
                !m.items?.some((f) => f.catalogFood.name.toLowerCase().includes(search.toLowerCase()))) return false;
            if (typeFilter !== "all" && m.type !== typeFilter) return false;
            if (dateFrom && m.foodTime && new Date(m.foodTime) < new Date(dateFrom)) return false;
            return !(dateTo && m.foodTime && new Date(m.foodTime) > new Date(dateTo + "T23:59:59"));

        });
    }, [allMeals, search, typeFilter, dateFrom, dateTo]);

    const itemizedRows = useMemo(
        () => filtered.flatMap((meal) => (meal.items || []).map((item) => ({meal,
            food: {
                id: item.id,
                name: item.catalogFood.name,
                quantity: item.quantity,
                unit: item.unit,
                catalogFood: item.catalogFood
            }
        }))).filter(Boolean),
        [filtered],
    );
    const tableMaxHeight = `${TABLE_HEADER_HEIGHT_PX + TABLE_MAX_VISIBLE_ROWS * TABLE_ROW_HEIGHT_PX}px`;

    function handleDelete(id: string) {
        deleteMeal(id);
    }

    function handleDuplicate(id: string) {
        mealsRepo.duplicate(id);
        toast.success("Meal duplicated");
    }

    function handleEdit(meal: Meal) {
        setEditingMeal(meal);
        setEditDialogOpen(true);
    }

    function toggleMealSelection(mealId: string) {
        const newSelected = new Set(selectedMealIds);
        if (newSelected.has(mealId)) {
            newSelected.delete(mealId);
        } else {
            newSelected.add(mealId);
        }
        setSelectedMealIds(newSelected);
    }

    const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

    function handleBulkDelete() {
        if (selectedMealIds.size === 0) return;
        setBulkDeleteConfirmOpen(true);
    }

    function confirmBulkDelete() {
        bulkDelete(Array.from(selectedMealIds));
        setBulkDeleteConfirmOpen(false);
    }

    function toggleSelectAll() {
        if (selectedMealIds.size === filtered.length && filtered.length > 0) {
            setSelectedMealIds(new Set());
        } else {
            setSelectedMealIds(new Set(filtered.map((m) => m.id)));
        }
    }


    const bulkDeleteCount = selectedMealIds.size;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">History</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Browse and manage all your logged meals.</p>
            </div>

            <BulkDeleteConfirmDialog
                open={bulkDeleteConfirmOpen}
                onOpenChange={setBulkDeleteConfirmOpen}
                count={bulkDeleteCount}
                onConfirm={confirmBulkDelete}
            />

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
                                {[EMealType.BREAKFAST, EMealType.LUNCH, EMealType.DINNER, EMealType.SNACK, EMealType.OTHER].map((t) => (
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
                        {selectedMealIds.size > 0
                            ? `${selectedMealIds.size} meal${selectedMealIds.size !== 1 ? "s" : ""} selected`
                            : displayMode === "whole"
                                ? `${filtered.length} meal${filtered.length !== 1 ? "s" : ""}`
                                : `${itemizedRows.length} item${itemizedRows.length !== 1 ? "s" : ""}`}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {selectedMealIds.size > 0 && (
                            <Button
                                variant="destructive"
                                size="sm"
                                className="gap-1.5"
                                onClick={handleBulkDelete}
                            >
                                <Trash2 className="h-3.5 w-3.5"/> Delete Selected
                            </Button>
                        )}
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
                                    <TableHead className="w-10">
                                        {displayMode === "whole" && (
                                            <Checkbox
                                                checked={filtered.length > 0 && selectedMealIds.size === filtered.length}
                                                onCheckedChange={toggleSelectAll}
                                                aria-label="Select all"
                                            />
                                        )}
                                    </TableHead>
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
                                    ? allMeals?.map((meal: Meal) => (
                                        <TableRow key={meal.id} className="border-border/50 hover:bg-muted/30">
                                            <TableCell className="w-10">
                                                <Checkbox
                                                    checked={selectedMealIds.has(meal.id)}
                                                    onCheckedChange={() => toggleMealSelection(meal.id)}
                                                    aria-label="Select meal"
                                                />
                                            </TableCell>
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
                                                {meal.foodTime && new Date(meal.foodTime).toLocaleDateString("en-US", {
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
                                                        onClick={() => handleEdit(meal)}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5"/>
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
                                            <TableCell className="w-10"/>
                                            <TableCell className="font-medium text-sm py-3">{meal.title}</TableCell>
                                            <TableCell
                                                className="text-xs text-muted-foreground max-w-60 sm:max-w-[320px] wrap-break-word">
                                                {food.name} {food.quantity} {food.unit}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] capitalize ${MEAL_TYPE_COLORS[meal.type]}`}
                                                >
                                                    {meal.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {meal.foodTime && new Date(meal.foodTime).toLocaleDateString("en-US", {
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
                                                        variant="ghost" size="icon" className="h-7 w-7"
                                                        onClick={() => handleEdit(meal)}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5"/>
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
                onEdit={handleEdit}
            />

            {editDialogOpen && (
                <LogMealDialog
                    mealToEdit={editingMeal}
                    onOpenChange={(open) => {
                        if (!open) {
                            setEditDialogOpen(false);
                            setEditingMeal(null);
                        }
                    }}
                />
            )}
        </div>
    );
}
