"use client";

import { DevTool } from "@hookform/devtools";
import { useEffect, useState } from "react";

import { redirect } from "next/navigation";
import { EMealType, EMealUnit, Meal } from "@/core/types/models/meal";
import {
    ActionIcon,
    Badge,
    Box,
    Button,
    Flex,
    Group,
    NumberInput,
    Paper,
    Select,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
    ThemeIcon,
    UnstyledButton,
} from "@mantine/core";
import {
    Apple,
    Check,
    CircleAlert,
    Clock,
    Minus,
    Moon,
    Plus,
    Sun,
    Sunrise,
    Trash2,
    Utensils,
    WifiOff,
    type LucideIcon,
} from "lucide-react";
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

/**
 * Design colouring for each meal type: Mantine palette name for `color=`
 * props, the matching CSS token for borders/tints, and the lucide glyph.
 * Shared with the natural-language widgets.
 */
export type MealTypeMeta = {
    label: string;
    color: string;
    token: string;
    Icon: LucideIcon;
};

export const MEAL_TYPE_META: Record<EMealType, MealTypeMeta> = {
    [EMealType.BREAKFAST]: {
        label: "Breakfast",
        color: "amber",
        token: "var(--am)",
        Icon: Sunrise,
    },
    [EMealType.LUNCH]: {
        label: "Lunch",
        color: "alimenta",
        token: "var(--ac)",
        Icon: Sun,
    },
    [EMealType.DINNER]: {
        label: "Dinner",
        color: "sky",
        token: "var(--bl)",
        Icon: Moon,
    },
    [EMealType.SNACK]: {
        label: "Snack",
        color: "rose",
        token: "var(--ro)",
        Icon: Apple,
    },
    [EMealType.OTHER]: {
        label: "Other",
        color: "gray",
        token: "var(--tx3)",
        Icon: Utensils,
    },
};

export function getMealTypeMeta(
    value: string | null | undefined
): MealTypeMeta {
    const normalized = (value ?? "").trim().toUpperCase() as EMealType;
    return MEAL_TYPE_META[normalized] ?? MEAL_TYPE_META[EMealType.OTHER];
}

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

function formatWhen(value: unknown): string {
    if (!value) return "Not set";
    const date = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(date.getTime())) return "Not set";
    return date.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

const TILE_MOTION = "transform 160ms, border-color 160ms, background 160ms";

function MealTypeTile({
    type,
    active,
    onSelect,
}: {
    type: EMealType;
    active: boolean;
    onSelect: () => void;
}) {
    const meta = MEAL_TYPE_META[type];
    return (
        <UnstyledButton
            type="button"
            onClick={onSelect}
            aria-pressed={active}
            h={96}
            p={14}
            c="var(--tx)"
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "space-between",
                borderRadius: 18,
                border: `1.5px solid ${active ? meta.token : "var(--bd)"}`,
                background: active
                    ? `color-mix(in srgb, ${meta.token} 10%, transparent)`
                    : "var(--sf2)",
                whiteSpace: "nowrap",
                transition: TILE_MOTION,
            }}
        >
            <ThemeIcon variant={active ? "filled" : "light"} color={meta.color}>
                <meta.Icon size={16} />
            </ThemeIcon>
            <Text fw={600} fz={14} lh={1.2}>
                {meta.label}
            </Text>
        </UnstyledButton>
    );
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
    const watchedTitle = useWatch({ control, name: "title" });
    const watchedType = useWatch({ control, name: "type" });
    const watchedMealTime = useWatch({ control, name: "mealTime" });
    const devToolControl = control as unknown as Control<MealFormInput>;

    useEffect(() => {
        setMounted(true);
    }, []);

    /********************************************* MUTATIONS ************************************************/
    const {
        mutate: mutateCreate,
        isPending: isCreatingPending,
        isSuccess: isCreateSuccess,
        isError: isCreateError,
    } = useMutation({
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

    const {
        mutate: mutateEdit,
        isPending: isEditingPending,
        isSuccess: isEditSuccess,
        isError: isEditError,
    } = useMutation({
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
    const isSaved = isCreateSuccess || isEditSuccess;
    const saveFailed = isCreateError || isEditError;

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

    function stepQuantity(index: number, delta: number) {
        const current = Number(watchedItems?.[index]?.quantity);
        const base = Number.isFinite(current) ? current : 0;
        setValue(
            `items.${index}.quantity`,
            Math.max(0, Math.round((base + delta) * 100) / 100),
            { shouldDirty: true, shouldValidate: true }
        );
    }

    // const sliderLabel = (v: number) => ["", "Poor", "Fair", "Okay", "Good", "Great"][v] ?? "";

    /********************************************* DERIVED ************************************************/
    const selectedType = getMealTypeMeta(watchedType);
    const namedFoods = (watchedItems ?? []).filter(
        (item) => (item?.foodName ?? "").trim().length > 0
    );
    const itemsErrorMessage =
        errors.items?.root?.message ||
        (Array.isArray(errors.items) &&
        errors.items.some((foodError) => foodError?.foodName)
            ? "All food items need a name"
            : "");
    const saving = isSubmitting || isPending;
    const saveLabel = saving ? "Saving…" : isSaved ? "Saved" : "Save meal";

    return (
        <>
            <Box
                component="form"
                onSubmit={handleSubmit(handleSave)}
                noValidate
            >
                <Flex wrap="wrap" gap={12} align="flex-start">
                    {/* ── Left column ─────────────────────────────── */}
                    <Stack gap={12} style={{ flex: "8 1 520px", minWidth: 0 }}>
                        {/* Basic info */}
                        <Paper p={22}>
                            <Stack gap={18}>
                                <Text fw={700} fz={16}>
                                    What kind of meal?
                                </Text>
                                <Controller
                                    control={control}
                                    name="type"
                                    render={({ field }) => (
                                        <SimpleGrid
                                            cols={{ base: 2, sm: 5 }}
                                            spacing={10}
                                        >
                                            {MEAL_TYPES.map((t) => (
                                                <MealTypeTile
                                                    key={t}
                                                    type={t}
                                                    active={field.value === t}
                                                    onSelect={() =>
                                                        field.onChange(t)
                                                    }
                                                />
                                            ))}
                                        </SimpleGrid>
                                    )}
                                />
                                {errors.type && (
                                    <Text fz={12} fw={500} c="var(--ro)">
                                        {errors.type.message}
                                    </Text>
                                )}
                                <Flex wrap="wrap" gap={12}>
                                    <TextInput
                                        id="title"
                                        size="lg"
                                        label="Meal name"
                                        placeholder="e.g. Avocado Toast & Eggs"
                                        error={errors.title?.message}
                                        style={{
                                            flex: "1.6 1 220px",
                                            minWidth: 0,
                                        }}
                                        {...register("title")}
                                    />
                                    <TextInput
                                        id="date"
                                        size="lg"
                                        type="datetime-local"
                                        label="When"
                                        leftSection={<Clock size={15} />}
                                        error={errors.mealTime?.message}
                                        style={{
                                            flex: "1 1 200px",
                                            minWidth: 0,
                                        }}
                                        styles={{ input: { fontSize: 15 } }}
                                        {...register("mealTime")}
                                    />
                                </Flex>
                            </Stack>
                        </Paper>

                        {/* Foods */}
                        <Paper p={22}>
                            <Stack gap={12}>
                                <Group justify="space-between" align="center">
                                    <Text fw={700} fz={16}>
                                        Foods
                                    </Text>
                                    <Text fz={12} c="var(--tx3)">
                                        {items.length}{" "}
                                        {items.length === 1 ? "item" : "items"}
                                    </Text>
                                </Group>

                                {itemsErrorMessage && (
                                    <Paper
                                        radius={16}
                                        p={16}
                                        shadow="none"
                                        withBorder={false}
                                        bg="color-mix(in srgb, var(--ro) 7%, transparent)"
                                        style={{
                                            border: "1.5px dashed var(--ro)",
                                            animation: "alm-shake 400ms ease",
                                        }}
                                    >
                                        <Group gap={12} wrap="nowrap">
                                            <ThemeIcon
                                                size={38}
                                                radius={12}
                                                variant="light"
                                                color="rose"
                                            >
                                                <CircleAlert size={17} />
                                            </ThemeIcon>
                                            <Box miw={0}>
                                                <Text fw={600} c="var(--ro)">
                                                    {itemsErrorMessage}
                                                </Text>
                                                <Text
                                                    fz={12}
                                                    c="var(--tx3)"
                                                    mt={2}
                                                >
                                                    Pick a food from the catalog
                                                    for every row.
                                                </Text>
                                            </Box>
                                        </Group>
                                    </Paper>
                                )}

                                {items.map((food, index) => {
                                    const quantityError =
                                        errors.items?.[index]?.quantity
                                            ?.message;
                                    const foodLabel =
                                        watchedItems?.[index]?.foodName ||
                                        "food";

                                    return (
                                        <Paper
                                            key={food.id}
                                            radius={16}
                                            p={10}
                                            pl={14}
                                            bg="var(--sf2)"
                                            shadow="none"
                                            withBorder={false}
                                        >
                                            <Flex
                                                gap={12}
                                                align="center"
                                                wrap="wrap"
                                            >
                                                <Box
                                                    style={{
                                                        flex: "1 1 200px",
                                                        minWidth: 0,
                                                    }}
                                                >
                                                    <Controller
                                                        control={control}
                                                        name={
                                                            `items.${index}.foodName` as const
                                                        }
                                                        render={({ field }) => (
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
                                                                    errors
                                                                        .items?.[
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
                                                        )}
                                                    />
                                                </Box>

                                                <Group
                                                    gap={8}
                                                    wrap="nowrap"
                                                    ml="auto"
                                                >
                                                    {/* Quantity stepper */}
                                                    <Group
                                                        gap={2}
                                                        p={3}
                                                        wrap="nowrap"
                                                        bg="var(--sf)"
                                                        style={{
                                                            borderRadius: 12,
                                                            border: "1px solid var(--bd)",
                                                        }}
                                                    >
                                                        <ActionIcon
                                                            variant="subtle"
                                                            size={30}
                                                            radius={9}
                                                            aria-label={`Decrease quantity for ${foodLabel}`}
                                                            onClick={() =>
                                                                stepQuantity(
                                                                    index,
                                                                    -1
                                                                )
                                                            }
                                                        >
                                                            <Minus size={14} />
                                                        </ActionIcon>
                                                        <Controller
                                                            control={control}
                                                            name={
                                                                `items.${index}.quantity` as const
                                                            }
                                                            render={({
                                                                field,
                                                            }) => (
                                                                <NumberInput
                                                                    variant="unstyled"
                                                                    hideControls
                                                                    min={0}
                                                                    step={0.01}
                                                                    decimalScale={
                                                                        2
                                                                    }
                                                                    w={64}
                                                                    aria-label={`Quantity for ${foodLabel}`}
                                                                    value={
                                                                        field.value as
                                                                            | number
                                                                            | string
                                                                    }
                                                                    onChange={
                                                                        field.onChange
                                                                    }
                                                                    onBlur={
                                                                        field.onBlur
                                                                    }
                                                                    error={Boolean(
                                                                        quantityError
                                                                    )}
                                                                    styles={{
                                                                        input: {
                                                                            height: 30,
                                                                            minHeight: 30,
                                                                            paddingInline: 4,
                                                                            textAlign:
                                                                                "center",
                                                                            fontWeight: 600,
                                                                            fontVariantNumeric:
                                                                                "tabular-nums",
                                                                        },
                                                                    }}
                                                                />
                                                            )}
                                                        />
                                                        <ActionIcon
                                                            variant="subtle"
                                                            size={30}
                                                            radius={9}
                                                            aria-label={`Increase quantity for ${foodLabel}`}
                                                            onClick={() =>
                                                                stepQuantity(
                                                                    index,
                                                                    1
                                                                )
                                                            }
                                                        >
                                                            <Plus size={14} />
                                                        </ActionIcon>
                                                    </Group>

                                                    <Controller
                                                        control={control}
                                                        name={
                                                            `items.${index}.unit` as const
                                                        }
                                                        render={({ field }) => (
                                                            <Select
                                                                size="sm"
                                                                radius={10}
                                                                w={96}
                                                                aria-label={`Unit for ${foodLabel}`}
                                                                value={
                                                                    field.value
                                                                }
                                                                onChange={(
                                                                    selected
                                                                ) =>
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
                                                                styles={{
                                                                    input: {
                                                                        backgroundColor:
                                                                            "var(--sf)",
                                                                    },
                                                                }}
                                                            />
                                                        )}
                                                    />

                                                    <ActionIcon
                                                        variant="subtle"
                                                        size={34}
                                                        radius={10}
                                                        c="var(--tx3)"
                                                        aria-label="Remove"
                                                        onClick={() =>
                                                            removeItem(index)
                                                        }
                                                        disabled={
                                                            items.length === 1
                                                        }
                                                    >
                                                        <Trash2 size={15} />
                                                    </ActionIcon>
                                                </Group>
                                            </Flex>
                                            {quantityError && (
                                                <Text
                                                    fz={12}
                                                    fw={500}
                                                    c="var(--ro)"
                                                    mt={6}
                                                >
                                                    {quantityError}
                                                </Text>
                                            )}
                                        </Paper>
                                    );
                                })}

                                {/* Add row */}
                                <Paper
                                    radius={16}
                                    p={12}
                                    bg="transparent"
                                    shadow="none"
                                    withBorder={false}
                                    style={{
                                        border: "1.5px dashed var(--bd2)",
                                    }}
                                >
                                    <Group gap={8} wrap="wrap">
                                        <Box
                                            mx={4}
                                            c="var(--tx3)"
                                            style={{ display: "flex" }}
                                        >
                                            <Plus size={15} />
                                        </Box>
                                        <Text fz={13} c="var(--tx2)" mr={4}>
                                            Something else on the plate?
                                        </Text>
                                        <Button
                                            type="button"
                                            variant="default"
                                            size="xs"
                                            onClick={() =>
                                                addItem({ ...emptyFood() })
                                            }
                                        >
                                            Add food
                                        </Button>
                                    </Group>
                                </Paper>
                            </Stack>
                        </Paper>
                    </Stack>

                    {/* ── Right column (sticky summary) ───────────── */}
                    <Stack
                        gap={12}
                        pos={{ base: "static", md: "sticky" }}
                        top={12}
                        style={{ flex: "4 1 300px", minWidth: 0 }}
                    >
                        <Paper p={22}>
                            <Stack gap={18}>
                                <Group justify="space-between" align="center">
                                    <Text fw={700} fz={16}>
                                        This meal
                                    </Text>
                                    <Badge
                                        color={selectedType.color}
                                        leftSection={
                                            <selectedType.Icon size={12} />
                                        }
                                    >
                                        {selectedType.label}
                                    </Badge>
                                </Group>

                                <Group gap={18} wrap="nowrap">
                                    <ThemeIcon
                                        size={64}
                                        radius={20}
                                        color={selectedType.color}
                                    >
                                        <selectedType.Icon size={28} />
                                    </ThemeIcon>
                                    <Box>
                                        <Text
                                            fz={38}
                                            fw={700}
                                            lh={1}
                                            style={{
                                                letterSpacing: "-0.04em",
                                                fontVariantNumeric:
                                                    "tabular-nums",
                                            }}
                                        >
                                            {namedFoods.length}
                                        </Text>
                                        <Text fz={13} c="var(--tx3)" mt={4}>
                                            {namedFoods.length === 1
                                                ? "food"
                                                : "foods"}{" "}
                                            in this meal
                                        </Text>
                                    </Box>
                                </Group>

                                <Stack gap={10}>
                                    <Group
                                        justify="space-between"
                                        gap={12}
                                        wrap="nowrap"
                                    >
                                        <Text fz={13} c="var(--tx2)">
                                            Name
                                        </Text>
                                        <Text
                                            fz={13}
                                            fw={600}
                                            ta="right"
                                            truncate
                                            c={
                                                watchedTitle?.trim()
                                                    ? "var(--tx)"
                                                    : "var(--tx3)"
                                            }
                                        >
                                            {watchedTitle?.trim() ||
                                                "Untitled meal"}
                                        </Text>
                                    </Group>
                                    <Group
                                        justify="space-between"
                                        gap={12}
                                        wrap="nowrap"
                                    >
                                        <Text fz={13} c="var(--tx2)">
                                            When
                                        </Text>
                                        <Text
                                            fz={13}
                                            fw={600}
                                            ta="right"
                                            style={{
                                                fontVariantNumeric:
                                                    "tabular-nums",
                                            }}
                                        >
                                            {formatWhen(watchedMealTime)}
                                        </Text>
                                    </Group>
                                    <Group
                                        justify="space-between"
                                        gap={12}
                                        wrap="nowrap"
                                        align="flex-start"
                                    >
                                        <Text fz={13} c="var(--tx2)">
                                            Foods
                                        </Text>
                                        <Text
                                            fz={13}
                                            fw={600}
                                            ta="right"
                                            lineClamp={3}
                                            c={
                                                namedFoods.length
                                                    ? "var(--tx)"
                                                    : "var(--tx3)"
                                            }
                                        >
                                            {namedFoods.length
                                                ? namedFoods
                                                      .map((item) =>
                                                          `${item.quantity ?? ""} ${item.unit ?? ""} ${item.foodName}`.trim()
                                                      )
                                                      .join(" · ")
                                                : "Nothing added yet"}
                                        </Text>
                                    </Group>
                                </Stack>

                                <Button
                                    type="submit"
                                    size="lg"
                                    radius={16}
                                    fullWidth
                                    fw={700}
                                    fz={15}
                                    variant={
                                        saveFailed
                                            ? "filled"
                                            : isSaved
                                              ? "gradient"
                                              : "filled"
                                    }
                                    color={saveFailed ? "rose" : undefined}
                                    loading={saving}
                                    leftSection={<Check size={17} />}
                                    aria-live="polite"
                                    style={{
                                        animation: saveFailed
                                            ? "alm-shake 400ms ease"
                                            : undefined,
                                    }}
                                >
                                    {saveFailed && !saving
                                        ? "Try again"
                                        : saveLabel}
                                </Button>
                                {saveFailed && (
                                    <Group
                                        gap={6}
                                        align="flex-start"
                                        wrap="nowrap"
                                        mt={-8}
                                        c="var(--ro)"
                                    >
                                        <Box mt={2} style={{ display: "flex" }}>
                                            <WifiOff size={13} />
                                        </Box>
                                        <Text fz={12} lh={1.45} c="var(--ro)">
                                            Couldn&apos;t reach the server. Your
                                            meal is still here, so just try
                                            again.
                                        </Text>
                                    </Group>
                                )}
                            </Stack>
                        </Paper>
                    </Stack>
                </Flex>
            </Box>
            {mounted && process.env.NODE_ENV === "development" && (
                <DevTool control={devToolControl} />
            )}
        </>
    );
}
