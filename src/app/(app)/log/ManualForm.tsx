"use client";

import {DevTool} from "@hookform/devtools";

import {redirect} from "next/navigation";
import {EMealType, Meal} from "@/core/types";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {Slider} from "@/components/ui/slider";
import {Separator} from "@/components/ui/separator";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Loader2, Plus, Trash2} from "lucide-react";
import {Controller, useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "sonner";
import {useMutation} from "@tanstack/react-query";
import {logMeal, updateMeal} from "@/services/meal/mutations";
import {FoodRow, MealFormValues} from "@/core/meals/types";
import {z} from "zod";
import {MEAL_TYPES, mealSchema} from "@/contracts/meals/create-meal.schema";


// ─── Types ───────────────────────────────────────────────────────────────────

function uid() {
    return Math.random().toString(36).slice(2, 10);
}

function emptyFood(): FoodRow {
    return {id: uid(), name: "", quantity: "1", unit: "g"};
}

const UNITS = ["g", "ml", "oz", "cup", "tbsp", "tsp", "piece", "slice", "serving", "whole", "large", "medium", "small"];

// ─── Manual Form ─────────────────────────────────────────────────────────────


type MealFormSchema = z.infer<typeof mealSchema>;

export function ManualForm({prefill, onSuccess}: { prefill?: Partial<Meal>, onSuccess?: () => void }) {
    const form = useForm<MealFormSchema>({
        resolver: zodResolver(mealSchema),
        defaultValues: {
            title: prefill?.title ?? "",
            date: prefill?.foodTime
                ? new Date(prefill.foodTime).toISOString().slice(0, 16)
                : new Date().toISOString().slice(0, 16),
            mealType: prefill?.type ?? EMealType.LUNCH,
            foods: ((prefill?.items as any) || [])?.map((f: any) => ({
                id: f.catalogFoodId,
                name: f.catalogFood.name,
                quantity: String(f.quantity),
                unit: f.unit
            })) ?? [{...emptyFood(), id: ""}],
            nutrition: {
                calories: String(prefill?.nutrition?.calories ?? ""),
                protein: String(prefill?.nutrition?.protein ?? ""),
                carbs: String(prefill?.nutrition?.carbs ?? ""),
                fat: String(prefill?.nutrition?.fat ?? ""),
            },
            mood: prefill?.mood ?? 3,
            energy: prefill?.energy ?? 3,
            digestion: prefill?.digestion ?? 3,
            notes: prefill?.notes ?? "",
        }
    })
    const {register, control, handleSubmit, reset, formState: {errors, isSubmitting}} = form
    const {fields: foods, append: addFood, remove: removeFood} = useFieldArray({
        control,
        name: "foods"
    })

    /********************************************* MUTATIONS ************************************************/
    const {mutate, isPending} = useMutation({
        mutationKey: ["log-meal"],
        mutationFn: async (data: MealFormSchema) => {
            if (prefill?.id) {
                // Update existing meal
                return updateMeal(prefill.id, data)
            } else {
                // Create new meal
                return logMeal(data)
            }
        },
        onSuccess: () => {
            const isEditing = !!prefill?.id;
            toast.success(isEditing ? "Meal updated successfully!" : "Meal logged successfully!");
            if (onSuccess) {
                onSuccess();
            } else {
                redirect("/history")
            }
            reset()
        },
        onError: (error) => {
            console.error("Error saving meal:", error);
            toast.error("Failed to save meal. Please try again.");
        },
    })

    /********************************************* HANDLERS ************************************************/
    function handleSave(data: MealFormSchema) {
        mutate(data)
    }

    const sliderLabel = (v: number) => ["", "Poor", "Fair", "Okay", "Good", "Great"][v] ?? "";

    return (
        <>
            <form onSubmit={handleSubmit(handleSave)} className="space-y-6" noValidate>
                <div>
                    {/* Basic info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="title">Meal title <span className="text-destructive">*</span></Label>
                            <Input
                                id="title"
                                placeholder="e.g. Avocado Toast & Eggs"
                                className={errors.title ? "border-destructive" : ""}
                                {...register("title")}
                            />
                            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="date">Date & time <span className="text-destructive">*</span></Label>
                            <Input
                                id="date"
                                type="datetime-local"
                                className={errors.date ? "border-destructive" : ""}
                                {...register("date")}
                            />
                            {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Meal type</Label>
                            <Controller
                                control={control}
                                name="mealType"
                                render={({field}) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select meal type"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MEAL_TYPES.map((t) => (
                                                <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.mealType && <p className="text-xs text-destructive">{errors.mealType.message}</p>}
                        </div>
                    </div>

                    <Separator className="my-4"/>

                    {/* Foods */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Foods <span className="text-destructive">*</span></Label>
                            <Button variant="outline" size="sm" onClick={() => addFood({...emptyFood(), id: ""})}
                                    className="gap-1.5 h-7 text-xs" type="button">
                                <Plus className="h-3 w-3"/> Add food
                            </Button>
                        </div>
                        {errors.foods && <p className="text-xs text-destructive">
                            {errors.foods.root?.message || (Array.isArray(errors.foods) && errors.foods.some(f => f?.name) ? "All food items need a name" : "")}
                        </p>}
                        <div className="space-y-2">
                            {foods.map((food, index) => (
                                <div key={food.id} className="flex gap-2 items-center">
                                    <Input
                                        placeholder="Food name"
                                        className="flex-1"
                                        {...register(`foods.${index}.name` as const)}
                                    />
                                    <Input
                                        placeholder="Qty"
                                        className="w-20"
                                        type="number"
                                        min={0}
                                        {...register(`foods.${index}.quantity` as const)}
                                    />
                                    <Controller
                                        control={control}
                                        name={`foods.${index}.unit` as const}
                                        render={({field}) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className="w-24">
                                                    <SelectValue/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                                        onClick={() => removeFood(index)}
                                        disabled={foods.length === 1}
                                        type="button"
                                    >
                                        <Trash2 className="h-3.5 w-3.5"/>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator className="my-4"/>

                    {/* Macros */}
                    <div className="space-y-5">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wide">Optional macros</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                {label: "Calories (kcal)", name: "nutrition.calories"},
                                {label: "Protein (g)", name: "nutrition.protein"},
                                {label: "Carbs (g)", name: "nutrition.carbs"},
                                {label: "Fat (g)", name: "nutrition.fat"},
                            ].map(({label, name}) => (
                                <div key={label} className="space-y-1.5">
                                    <Label className="text-xs">{label}</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="—"
                                        {...register(name as `nutrition.${Extract<keyof MealFormValues["nutrition"], string>}`)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator className="my-4"/>

                    {/* Journal */}
                    <div className="space-y-4">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wide">How did you
                            feel?</Label>
                        {([
                            {label: "Mood", name: "mood"},
                            {label: "Energy", name: "energy"},
                            {label: "Digestion", name: "digestion"},
                        ] as const).map(({label, name}) => (
                            <div key={label} className="space-y-2">
                                <Controller
                                    control={control}
                                    name={name}
                                    render={({field}) => (
                                        <>

                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm">{label}</Label>
                                                <span
                                                    className="text-xs text-muted-foreground">{sliderLabel(field.value)}</span>
                                            </div>
                                            <Slider
                                                min={1} max={5} step={1}
                                                value={[field.value]}
                                                onValueChange={([v]) => field.onChange(v)}
                                                className="w-full"
                                            />
                                        </>
                                    )}
                                />
                                <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
                                    {[1, 2, 3, 4, 5].map((n) => <span key={n}>{n}</span>)}
                                </div>
                            </div>
                        ))}
                        <div className="space-y-1.5 mb-6">
                            <Label className="text-sm">Notes</Label>
                            <Textarea
                                placeholder="How did this meal make you feel? Any observations…"
                                rows={3}
                                {...register("notes")}
                            />
                        </div>
                    </div>
                    {
                        <Button type={"submit"} className="w-full sm:w-auto" disabled={isSubmitting || isPending}>
                            {
                                isSubmitting || isPending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                                ) : (
                                    <span>
                                            Save Meal
                                        </span>
                                )
                            }
                        </Button>
                    }
                </div>
            </form>
            <DevTool control={control}/>
        </>
    );
}