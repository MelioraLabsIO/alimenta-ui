"use client";

import { DevTool } from "@hookform/devtools";
import { useEffect, useState } from "react";

import { redirect } from "next/navigation";
import { EMealType, EMealUnit, Meal } from "@/core/types/models/meal";
import { Button } from "@/components/mantine/ui";
import { Input } from "@/components/mantine/ui";
import { Text } from "@/components/mantine/ui";
import { Separator } from "@/components/mantine/ui";
import { Select } from "@mantine/core";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
    type Control,
    Controller,
    useFieldArray,
    useForm,
    useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/lib/notifications";
import { useMutation } from "@tanstack/react-query";
import { saveMeal, updateMeal } from "@/apis/meal/mutations";
import { FoodRow } from "@/apis/meal/types";
import { z } from "zod";
import { MEAL_TYPES, mealSchema } from "@/contracts/meals/create-meal.schema";
import { SaveMealDTO } from "@/core/types/dto";
import type { FoodSearchItem } from "@/apis/food/queries";
import { Autocomplete } from "@/components/foods/autocomplete";

// ─── Types ───────────────────────────────────────────────────────────────────

function uid() {
    return Math.random().toString(36).slice(2, 10);
}

function emptyFood(): FoodRow {
    return {
        foodSourceId: uid(),
        foodSource: "catalog",
        foodName: "",
        quantity: 1,
        unit: EMealUnit.GRAM,
    };
}

const UNITS: EMealUnit[] = [
    EMealUnit.KG,
    EMealUnit.LB,
    EMealUnit.ML,
    EMealUnit.UNIT,
    EMealUnit.GRAM,
    EMealUnit.OZ,
    EMealUnit.CUP,
    EMealUnit.TABLESPOON,
    EMealUnit.TEASPOON,
    EMealUnit.PIECE,
    EMealUnit.SLICE,
    EMealUnit.SERVING,
    EMealUnit.WHOLE,
    EMealUnit.LARGE,
    EMealUnit.MEDIUM,
    EMealUnit.SMALL,
];

// ─── Manual Form ─────────────────────────────────────────────────────────────

type MealFormInput = z.input<typeof mealSchema>;
type MealFormSchema = z.output<typeof mealSchema>;

function formatDateTimeLocal(value: string | Date): string {
    const date = value instanceof Date ? value : new Date(value);
    const localDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
    );
    return localDate.toISOString().slice(0, 16);
}

export function ManualForm({
    prefill,
    onSuccess,
}: {
    prefill?: Partial<Meal>;
    onSuccess?: () => void;
}) {
    const [mounted, setMounted] = useState(false);
    const prefillFoods: FoodRow[] =
        prefill?.items?.map((f) => ({
            foodSourceId: f.id,
            foodSource: "catalog",
            foodName: f.foodName,
            quantity: f.quantity,
            unit: f.unit ?? EMealUnit.GRAM,
        })) ?? [];

    const form = useForm<MealFormInput, unknown, MealFormSchema>({
        resolver: zodResolver(mealSchema),
        defaultValues: {
            title: prefill?.title ?? "",
            mealTime: prefill?.mealTime
                ? formatDateTimeLocal(prefill.mealTime)
                : formatDateTimeLocal(new Date()),
            type: prefill?.type ?? EMealType.LUNCH,
            items: prefillFoods.length > 0 ? prefillFoods : [emptyFood()],
        },
    });

    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = form;
    const {
        fields: items,
        append: addItem,
        remove: removeItem,
    } = useFieldArray({
        control,
        name: "items",
    });
    const watchedItems = useWatch({ control, name: "items" });
    const devToolControl = control as unknown as Control<MealFormInput>;

    useEffect(() => {
        setMounted(true);
    }, []);

    /********************************************* MUTATIONS ************************************************/
    const { mutate: mutateCreate, isPending: isCreatingPending } = useMutation({
        mutationKey: ["save-meal"],
        mutationFn: async (data: SaveMealDTO) => {
            return saveMeal(data);
        },
        onSuccess: () => {
            toast.success("Meal logged successfully!");
            if (onSuccess) {
                onSuccess();
            } else {
                redirect("/history");
            }
            reset();
        },
        onError: (error) => {
            console.error("Error logging meal:", error);
            toast.error("Failed to log meal. Please try again.");
        },
    });

    const { mutate: mutateEdit, isPending: isEditingPending } = useMutation({
        mutationKey: ["edit-meal"],
        mutationFn: async (data: SaveMealDTO) => {
            if (!prefill?.id) {
                throw new Error("Meal ID is required for editing");
            }
            return updateMeal(prefill.id, {
                ...data,
                mealTime: new Date(data.mealTime),
            });
        },
        onSuccess: () => {
            toast.success("Meal updated successfully!");
            if (onSuccess) {
                onSuccess();
            } else {
                redirect("/history");
            }
            reset();
        },
        onError: (error) => {
            console.error("Error updating meal:", error);
            toast.error("Failed to update meal. Please try again.");
        },
    });

    const isPending = isCreatingPending || isEditingPending;

    /********************************************* HANDLERS ************************************************/
    function handleCreate(data: SaveMealDTO) {
        mutateCreate(data);
    }

    function handleEdit(data: SaveMealDTO) {
        mutateEdit(data);
    }

    function handleSave(meal: SaveMealDTO) {
        if (prefill?.id) {
            handleEdit(meal);
        } else {
            handleCreate(meal);
        }
    }

    // const sliderLabel = (v: number) => ["", "Poor", "Fair", "Okay", "Good", "Great"][v] ?? "";

    return (
        <>
            <form
                onSubmit={handleSubmit(handleSave)}
                className="space-y-6"
                noValidate
            >
                <div>
                    {/* Basic info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Text>
                                Meal title{" "}
                                <span className="text-destructive">*</span>
                            </Text>
                            <Input
                                id="title"
                                placeholder="e.g. Avocado Toast & Eggs"
                                className={
                                    errors.title ? "border-destructive" : ""
                                }
                                {...register("title")}
                            />
                            {errors.title && (
                                <p className="text-xs text-destructive">
                                    {errors.title.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Text>
                                Date & time{" "}
                                <span className="text-destructive">*</span>
                            </Text>
                            <Input
                                id="date"
                                type="datetime-local"
                                className={
                                    errors.mealTime ? "border-destructive" : ""
                                }
                                {...register("mealTime")}
                            />
                            {errors.mealTime && (
                                <p className="text-xs text-destructive">
                                    {errors.mealTime.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Text>Meal type</Text>
                            <Controller
                                control={control}
                                name="type"
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onChange={(selected) =>
                                            selected && field.onChange(selected)
                                        }
                                        data={MEAL_TYPES.map((t) => ({
                                            value: t,
                                            label: t,
                                        }))}
                                        placeholder="Select meal type"
                                    />
                                )}
                            />
                            {errors.type && (
                                <p className="text-xs text-destructive">
                                    {errors.type.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Foods */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Text>
                                Foods{" "}
                                <span className="text-destructive">*</span>
                            </Text>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addItem({ ...emptyFood() })}
                                className="gap-1.5 h-7 text-xs"
                                type="button"
                            >
                                <Plus className="h-3 w-3" /> Add food
                            </Button>
                        </div>
                        {errors.items && (
                            <p className="text-xs text-destructive">
                                {errors.items.root?.message ||
                                    (Array.isArray(errors.items) &&
                                    errors.items.some(
                                        (foodError) => foodError?.foodName
                                    )
                                        ? "All food items need a name"
                                        : "")}
                            </p>
                        )}
                        <div className="space-y-2">
                            {items.map((food, index) => (
                                <div key={food.id} className="space-y-1">
                                    <div className="grid grid-cols-[1fr_auto] gap-2 sm:flex sm:items-center">
                                        <Controller
                                            control={control}
                                            name={
                                                `items.${index}.foodName` as const
                                            }
                                            render={({ field }) => (
                                                <div className="col-span-2 min-w-0 sm:col-span-1 sm:flex-1">
                                                    <Autocomplete
                                                        value={
                                                            field.value
                                                                ? ({
                                                                      id:
                                                                          watchedItems?.[
                                                                              index
                                                                          ]
                                                                              ?.foodSourceId ??
                                                                          food.foodSourceId,
                                                                      name: field.value,
                                                                  } satisfies FoodSearchItem)
                                                                : null
                                                        }
                                                        error={Boolean(
                                                            errors.items?.[
                                                                index
                                                            ]?.foodName
                                                        )}
                                                        onChange={(
                                                            selectedFood
                                                        ) => {
                                                            field.onChange(
                                                                selectedFood.name
                                                            );
                                                            setValue(
                                                                `items.${index}.foodSourceId`,
                                                                selectedFood.id,
                                                                {
                                                                    shouldDirty: true,
                                                                    shouldValidate: true,
                                                                }
                                                            );
                                                            setValue(
                                                                `items.${index}.foodSource`,
                                                                "catalog",
                                                                {
                                                                    shouldDirty: true,
                                                                    shouldValidate: true,
                                                                }
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        />
                                        <div className="flex gap-2 min-w-0 sm:contents">
                                            <Input
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                className="min-w-0 flex-1 sm:w-24 sm:flex-none"
                                                aria-label={`Quantity for ${watchedItems?.[index]?.foodName || "food"}`}
                                                {...register(
                                                    `items.${index}.quantity` as const,
                                                    { valueAsNumber: true }
                                                )}
                                            />
                                            <Controller
                                                control={control}
                                                name={
                                                    `items.${index}.unit` as const
                                                }
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value}
                                                        onChange={(selected) =>
                                                            selected &&
                                                            field.onChange(
                                                                selected
                                                            )
                                                        }
                                                        data={UNITS.map(
                                                            (u) => ({
                                                                value: u,
                                                                label: u,
                                                            })
                                                        )}
                                                        className="min-w-0 flex-1 sm:w-24 sm:flex-none"
                                                    />
                                                )}
                                            />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 self-center text-muted-foreground hover:text-destructive shrink-0"
                                            onClick={() => removeItem(index)}
                                            disabled={items.length === 1}
                                            type="button"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                    {errors.items?.[index]?.foodName && (
                                        <p className="text-[10px] text-destructive px-1">
                                            {
                                                errors.items[index].foodName
                                                    .message
                                            }
                                        </p>
                                    )}
                                    {errors.items?.[index]?.quantity && (
                                        <p className="text-[10px] text-destructive px-1">
                                            {
                                                errors.items[index].quantity
                                                    .message
                                            }
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Macros */}
                    {/*<div className="space-y-5">*/}
                    {/*    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Optional macros</Label>*/}
                    {/*    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">*/}
                    {/*        {[*/}
                    {/*            {label: "Calories (kcal)", name: "nutrition.calories"},*/}
                    {/*            {label: "Protein (g)", name: "nutrition.protein"},*/}
                    {/*            {label: "Carbs (g)", name: "nutrition.carbs"},*/}
                    {/*            {label: "Fat (g)", name: "nutrition.fat"},*/}
                    {/*        ].map(({label, name}) => (*/}
                    {/*            <div key={label} className="space-y-1.5">*/}
                    {/*                <Label className="text-xs">{label}</Label>*/}
                    {/*                <Input*/}
                    {/*                    type="number"*/}
                    {/*                    min={0}*/}
                    {/*                    placeholder="—"*/}
                    {/*                    className={errors.nutrition?.[name] ? "border-destructive" : ""}*/}
                    {/*                    {...register(`nutrition.${name}`)}*/}
                    {/*                />*/}
                    {/*                {errors.nutrition?.[name] && (*/}
                    {/*                    <p className="text-[10px] text-destructive">*/}
                    {/*                        {errors.nutrition?.[name]?.message}*/}
                    {/*                    </p>*/}
                    {/*                )}*/}
                    {/*            </div>*/}
                    {/*        ))}*/}
                    {/*    </div>*/}
                    {/*</div>*/}

                    <Separator className="my-4" />

                    {/* Journal */}
                    {/*<div className="space-y-4">*/}
                    {/*    <Label className="text-muted-foreground text-xs uppercase tracking-wide">How did you*/}
                    {/*        feel?</Label>*/}
                    {/*    {([*/}
                    {/*        {label: "Mood", name: "mood"},*/}
                    {/*        {label: "Energy", name: "energy"},*/}
                    {/*        {label: "Digestion", name: "digestion"},*/}
                    {/*        {label: "Likeness", name: "likeness"},*/}
                    {/*    ] as const).map(({label, name}) => (*/}
                    {/*        <div key={label} className="space-y-2">*/}
                    {/*            <Controller*/}
                    {/*                control={control}*/}
                    {/*                name={name}*/}
                    {/*                render={({field}) => (*/}
                    {/*                    <>*/}

                    {/*                        <div className="flex items-center justify-between">*/}
                    {/*                            <Label className="text-sm">{label}</Label>*/}
                    {/*                            <span*/}
                    {/*                                className="text-xs text-muted-foreground">{sliderLabel(field.value)}</span>*/}
                    {/*                        </div>*/}
                    {/*                        <Slider*/}
                    {/*                            min={1} max={5} step={1}*/}
                    {/*                            value={[field.value]}*/}
                    {/*                            onValueChange={([v]) => field.onChange(v)}*/}
                    {/*                            className="w-full"*/}
                    {/*                        />*/}
                    {/*                    </>*/}
                    {/*                )}*/}
                    {/*            />*/}
                    {/*            <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">*/}
                    {/*                {[1, 2, 3, 4, 5].map((n) => <span key={n}>{n}</span>)}*/}
                    {/*            </div>*/}
                    {/*        </div>*/}
                    {/*    ))}*/}
                    {/*    <div className="space-y-1.5 mb-6">*/}
                    {/*        <Label className="text-sm">Notes</Label>*/}
                    {/*        <Textarea*/}
                    {/*            placeholder="How did this meal make you feel? Any observations…"*/}
                    {/*            rows={3}*/}
                    {/*            {...register("notes")}*/}
                    {/*        />*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    <Button
                        type="submit"
                        className="w-full sm:w-auto"
                        disabled={isSubmitting || isPending}
                    >
                        {isSubmitting || isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Meal"
                        )}
                    </Button>
                </div>
            </form>
            {mounted && process.env.NODE_ENV === "development" && (
                <DevTool control={devToolControl} />
            )}
        </>
    );
}
