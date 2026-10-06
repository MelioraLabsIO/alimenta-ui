"use client";

import { useMemo, useReducer, useState } from "react";
import { useLocalStorage } from "@mantine/hooks";
import Link from "next/link";
import { mealsRepo } from "@/apis/meal/mealsRepo";
import { EMealType, Meal } from "@/core/types/models/meal";
import { toast } from "@/lib/notifications";
import {
    ActionIcon,
    Box,
    Button,
    Center,
    Checkbox,
    Divider,
    Group,
    Modal,
    Paper,
    SegmentedControl,
    SimpleGrid,
    Skeleton,
    Stack,
    Table,
    Text,
    TextInput,
    ThemeIcon,
    Tooltip,
    UnstyledButton,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
    Apple,
    CalendarDays,
    Copy,
    History,
    LayoutGrid,
    List,
    Moon,
    Pencil,
    Plus,
    Search,
    SearchX,
    Sun,
    Sunrise,
    Trash2,
    Utensils,
    UtensilsCrossed,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllMeals } from "@/apis/meal/queries";
import { BulkDeleteConfirmDialog } from "@/components/meals/bulk-delete-confirm-dialog";
import {
    deleteMealById,
    bulkDeleteMeals,
    BulkDeleteMealsResponse,
} from "@/apis/meal/mutations";
import { LogMealDialog } from "@/components/meals/log-meal-dialog";
import { MealResponse } from "@/core/types/dto";

type MealTypeStyle = {
    label: string;
    color: string;
    token: string;
    icon: typeof Sunrise;
};

const MEAL_TYPE_STYLES: Record<string, MealTypeStyle> = {
    BREAKFAST: {
        label: "Breakfast",
        color: "amber",
        token: "var(--am)",
        icon: Sunrise,
    },
    LUNCH: { label: "Lunch", color: "alimenta", token: "var(--ac)", icon: Sun },
    DINNER: { label: "Dinner", color: "sky", token: "var(--bl)", icon: Moon },
    SNACK: { label: "Snack", color: "rose", token: "var(--ro)", icon: Apple },
    OTHER: {
        label: "Other",
        color: "gray",
        token: "var(--tx3)",
        icon: Utensils,
    },
};

const FILTER_TYPES = [
    EMealType.BREAKFAST,
    EMealType.LUNCH,
    EMealType.DINNER,
    EMealType.SNACK,
    EMealType.OTHER,
];

const WELLNESS_COLORS: Record<string, string> = {
    Mood: "var(--ac)",
    Energy: "var(--bl)",
    Digestion: "var(--am)",
    Likeness: "var(--ro)",
};

const TABLE_MAX_VISIBLE_ROWS = 20;
const TABLE_ROW_HEIGHT_PX = 44;
const TABLE_HEADER_HEIGHT_PX = 44;

function mealStyle(type: string): MealTypeStyle {
    return MEAL_TYPE_STYLES[type] ?? MEAL_TYPE_STYLES.OTHER;
}

function formatShortDate(date: Date) {
    const sameYear = date.getFullYear() === new Date().getFullYear();
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        ...(sameYear ? {} : { year: "numeric" }),
    });
}

function formatTime(date: Date) {
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });
}

function dayTitle(date: Date) {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", { weekday: "long" });
}

function formatKcal(value?: number | null) {
    return typeof value === "number" ? value.toLocaleString("en-US") : "—";
}

type DisplayMode = "whole" | "itemized";

/** How the by-day view is laid out: day cards in a grid, or one flat list. */
type HistoryLayout = "grid" | "list";

const LAYOUT_OPTIONS: {
    value: HistoryLayout;
    label: string;
    icon: typeof LayoutGrid;
}[] = [
    { value: "grid", label: "Cards", icon: LayoutGrid },
    { value: "list", label: "List", icon: List },
];

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

function historyViewReducer(
    state: HistoryViewState,
    action: HistoryViewAction
): HistoryViewState {
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
            return {
                ...state,
                search: "",
                typeFilter: "all",
                dateFrom: "",
                dateTo: "",
            };
        default:
            return state;
    }
}

/** Five 5px dots, one per mood point, as in the design's meal rows. */
function MoodDots({ value }: { value?: number }) {
    if (!value) return null;
    return (
        <Group gap={2} wrap="nowrap">
            {Array.from({ length: 5 }).map((_, i) => (
                <Box
                    key={i}
                    w={5}
                    h={5}
                    style={{
                        borderRadius: 999,
                        background: i < value ? "var(--ac)" : "var(--bd2)",
                    }}
                />
            ))}
        </Group>
    );
}

function TypeDot({ color, size = 8 }: { color: string; size?: number }) {
    return (
        <Box
            w={size}
            h={size}
            style={{ borderRadius: 999, background: color, flexShrink: 0 }}
        />
    );
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
    const moodLabel = (v: number) =>
        ["", "Poor", "Fair", "Okay", "Good", "Great"][v] ?? "";
    const style = mealStyle(mealData.type);
    const Icon = style.icon;

    const nutrition = mealData.nutrition
        ? [
              {
                  label: "Calories",
                  value: mealData.nutrition.calories,
                  unit: "kcal",
              },
              {
                  label: "Protein",
                  value: mealData.nutrition.protein,
                  unit: "g",
              },
              { label: "Carbs", value: mealData.nutrition.carbs, unit: "g" },
              { label: "Fat", value: mealData.nutrition.fat, unit: "g" },
          ]
        : [];

    const wellness = [
        { label: "Mood", value: mealData.mood },
        { label: "Energy", value: mealData.energy },
        { label: "Digestion", value: mealData.digestion },
        { label: "Likeness", value: mealData.likeness },
    ];

    return (
        <Modal
            opened={open}
            onClose={onClose}
            size={560}
            title={null}
            withCloseButton
            styles={{
                header: {
                    position: "absolute",
                    top: 0,
                    right: 0,
                    minHeight: 0,
                    padding: 14,
                    zIndex: 2,
                },
                body: { padding: 0 },
            }}
        >
            <Stack gap={18}>
                <Group gap={14} wrap="nowrap" pr={40}>
                    <ThemeIcon color={style.color} size={52} radius={16}>
                        <Icon size={22} />
                    </ThemeIcon>
                    <Box style={{ minWidth: 0 }}>
                        <Text
                            fz={22}
                            fw={700}
                            lh={1.2}
                            style={{ letterSpacing: "-0.025em" }}
                        >
                            {mealData.title}
                        </Text>
                        <Text fz={13} c="var(--tx3)" mt={2}>
                            {mealData.mealTime &&
                                new Date(mealData.mealTime).toLocaleString(
                                    "en-US",
                                    {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                    }
                                )}
                        </Text>
                    </Box>
                </Group>

                {nutrition.length > 0 && (
                    <SimpleGrid cols={{ base: 2, xs: 4 }} spacing={8}>
                        {nutrition.map(({ label, value, unit }) => (
                            <Paper
                                key={label}
                                radius={16}
                                p={12}
                                bg="var(--sf2)"
                                shadow="none"
                                withBorder={false}
                            >
                                <Text fz={11} c="var(--tx3)">
                                    {label}
                                </Text>
                                <Text
                                    fz={20}
                                    fw={700}
                                    mt={2}
                                    lh={1.2}
                                    style={{ letterSpacing: "-0.02em" }}
                                >
                                    {value ?? "—"}
                                    <Text
                                        component="span"
                                        fz={12}
                                        fw={500}
                                        c="var(--tx3)"
                                        ml={2}
                                    >
                                        {unit}
                                    </Text>
                                </Text>
                            </Paper>
                        ))}
                    </SimpleGrid>
                )}

                <Stack gap={4}>
                    {(mealData?.items || [])?.map((f) => (
                        <Group
                            key={f.id}
                            justify="space-between"
                            wrap="nowrap"
                            py={8}
                            style={{ borderBottom: "1px solid var(--bd)" }}
                        >
                            <Text fz={14} style={{ flex: 1, minWidth: 0 }}>
                                {f.foodName}
                            </Text>
                            <Text
                                fz={14}
                                c="var(--tx3)"
                                ml={12}
                                style={{ whiteSpace: "nowrap" }}
                            >
                                {f.quantity} {f.unit}
                            </Text>
                        </Group>
                    ))}
                </Stack>

                <SimpleGrid cols={{ base: 2, xs: 4 }} spacing={8}>
                    {wellness.map(({ label, value }) => (
                        <Paper
                            key={label}
                            radius={16}
                            p={12}
                            bg="transparent"
                            shadow="none"
                            withBorder
                        >
                            <Text fz={12} c="var(--tx3)">
                                {label}
                            </Text>
                            <Group gap={3} mt={8} wrap="nowrap">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Box
                                        key={i}
                                        h={6}
                                        style={{
                                            flex: 1,
                                            borderRadius: 999,
                                            background:
                                                value && i < value
                                                    ? WELLNESS_COLORS[label]
                                                    : "var(--sf2)",
                                        }}
                                    />
                                ))}
                            </Group>
                            <Text fz={12} fw={600} mt={6}>
                                {value ? moodLabel(value) : "—"}
                            </Text>
                        </Paper>
                    ))}
                </SimpleGrid>

                {mealData.notes && (
                    <Paper
                        radius={16}
                        px={14}
                        py={12}
                        bg="var(--acs)"
                        shadow="none"
                        withBorder={false}
                    >
                        <Text fz={14}>&#34;{mealData.notes}&#34;</Text>
                    </Paper>
                )}

                <Group gap={8}>
                    <Button
                        variant="default"
                        size="sm"
                        h={40}
                        leftSection={<Copy size={14} />}
                        onClick={() => {
                            onDuplicate(mealData.id);
                            onClose();
                        }}
                    >
                        Log again
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        h={40}
                        leftSection={<Pencil size={14} />}
                        onClick={() => {
                            onEdit(mealData);
                            onClose();
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="subtle"
                        color="rose"
                        size="sm"
                        h={40}
                        ml="auto"
                        leftSection={<Trash2 size={14} />}
                        onClick={() => {
                            onDelete(mealData.id);
                            onClose();
                        }}
                    >
                        Delete
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}

export default function HistoryPage() {
    const queryClient = useQueryClient();

    const [viewState, dispatch] = useReducer(
        historyViewReducer,
        initialHistoryViewState
    );
    const { search, typeFilter, dateFrom, dateTo, displayMode } = viewState;
    const [selected, setSelected] = useState<Meal | null>(null);
    const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedMealIds, setSelectedMealIds] = useState<Set<string>>(
        new Set()
    );
    // Remembered per browser; it's a presentation preference, not a filter.
    const [layout, setLayout] = useLocalStorage<HistoryLayout>({
        key: "history:layout",
        defaultValue: "grid",
    });
    const isGrid = layout === "grid";

    /********************************************* QUERIES ************************************************/
    const { data: allMeals, isLoading } = useQuery({
        queryKey: ["meals"],
        queryFn: () => getAllMeals(),
    });

    /********************************************* MUTATIONS ************************************************/
    const { mutate: deleteMeal } = useMutation({
        mutationKey: ["deleteMeal"],
        mutationFn: (id: string) => deleteMealById(id),
        onSuccess: (deletedMeal: Pick<Meal, "id">) => {
            toast.success("Meal deleted");
            queryClient.setQueryData(["meals"], (cachedData: Meal[]) => {
                if (!cachedData) return cachedData;

                return cachedData?.filter((meal) => meal.id !== deletedMeal.id);
            });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const { mutate: bulkDelete } = useMutation({
        mutationKey: ["bulkDeleteMeals"],
        mutationFn: (ids: string[]) => bulkDeleteMeals(ids),
        onSuccess: (result: BulkDeleteMealsResponse) => {
            toast.success(
                `${result.ids.length} meal${result.ids.length !== 1 ? "s" : ""} deleted`
            );
            queryClient.setQueryData(["meals"], (cachedData: Meal[]) => {
                if (!cachedData) return cachedData;

                return cachedData?.filter(
                    (meal) => !result.ids.includes(meal.id)
                );
            });
            setSelectedMealIds(new Set());
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    // Everything except the type filter, so the type pills can show how
    // many meals each one would reveal.
    const searchAndDateFiltered = useMemo(() => {
        if (!allMeals) return [];
        return allMeals.filter((m) => {
            if (
                search &&
                !m.title.toLowerCase().includes(search.toLowerCase()) &&
                !m.items?.some((f) =>
                    f.foodName.toLowerCase().includes(search.toLowerCase())
                )
            )
                return false;
            if (
                dateFrom &&
                m.mealTime &&
                new Date(m.mealTime) < new Date(dateFrom)
            )
                return false;
            return !(
                dateTo &&
                m.mealTime &&
                new Date(m.mealTime) > new Date(dateTo + "T23:59:59")
            );
        });
    }, [allMeals, search, dateFrom, dateTo]);

    const filtered = useMemo(
        () =>
            searchAndDateFiltered.filter(
                (m) => typeFilter === "all" || m.type === typeFilter
            ),
        [searchAndDateFiltered, typeFilter]
    );

    const typeCounts = useMemo(() => {
        const counts: Record<string, number> = {
            all: searchAndDateFiltered.length,
        };
        for (const m of searchAndDateFiltered) {
            counts[m.type] = (counts[m.type] ?? 0) + 1;
        }
        return counts;
    }, [searchAndDateFiltered]);

    const dayGroups = useMemo(() => {
        const groups = new Map<string, { date: Date; meals: Meal[] }>();
        for (const meal of filtered) {
            const date = meal.mealTime ? new Date(meal.mealTime) : new Date(0);
            const key = date.toDateString();
            const group = groups.get(key);
            if (group) {
                group.meals.push(meal);
            } else {
                groups.set(key, { date, meals: [meal] });
            }
        }
        return Array.from(groups.values()).sort(
            (a, b) => b.date.getTime() - a.date.getTime()
        );
    }, [filtered]);

    const itemizedRows = useMemo(
        () =>
            filtered
                .flatMap((meal) =>
                    (meal.items || []).map((item) => ({
                        meal,
                        food: {
                            id: item.id,
                            name: item.foodName,
                            quantity: item.quantity,
                            unit: item.unit,
                            calories: item.nutrition?.calories,
                        },
                    }))
                )
                .filter(Boolean),
        [filtered]
    );
    const tableMaxHeight =
        TABLE_HEADER_HEIGHT_PX + TABLE_MAX_VISIBLE_ROWS * TABLE_ROW_HEIGHT_PX;

    function handleDelete(id: string) {
        deleteMeal(id);
    }

    function handleDuplicate(id: string) {
        mealsRepo.duplicate(id);
        toast.success("Meal duplicated");
    }

    function handleEdit(meal: MealResponse) {
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
    const hasFilters = Boolean(
        search || typeFilter !== "all" || dateFrom || dateTo
    );
    const hasNoData = !isLoading && (allMeals?.length ?? 0) === 0;
    const visibleCount =
        displayMode === "whole" ? filtered.length : itemizedRows.length;
    const nothingMatches = !isLoading && !hasNoData && visibleCount === 0;

    const typePills = [
        { value: "all", label: "All", dot: "var(--gradient-accent)" },
        ...FILTER_TYPES.filter(
            (t) => t !== EMealType.OTHER || (typeCounts[t] ?? 0) > 0
        ).map((t) => ({
            value: t,
            label: mealStyle(t).label,
            dot: mealStyle(t).token,
        })),
    ];

    return (
        <Stack gap={12} maw={1100} mx="auto" w="100%">
            <BulkDeleteConfirmDialog
                open={bulkDeleteConfirmOpen}
                onOpenChange={setBulkDeleteConfirmOpen}
                count={bulkDeleteCount}
                onConfirm={confirmBulkDelete}
            />

            {/* Filters */}
            <Paper
                radius={22}
                p={8}
                bg="var(--glass)"
                shadow="none"
                withBorder
                style={{ backdropFilter: "blur(20px)" }}
            >
                <Group gap={8} wrap="wrap">
                    <TextInput
                        placeholder="Search meals or foods"
                        aria-label="Search meals or foods"
                        value={search}
                        onChange={(e) =>
                            dispatch({
                                type: "SET_SEARCH",
                                payload: e.target.value,
                            })
                        }
                        leftSection={<Search size={15} />}
                        radius={14}
                        size="sm"
                        style={{ flex: 1, minWidth: 220, maxWidth: 340 }}
                        styles={{
                            input: {
                                height: 40,
                                backgroundColor: "var(--sf)",
                                borderColor: "transparent",
                                fontSize: 14,
                            },
                        }}
                    />
                    {typePills.map((pill) => {
                        const active = typeFilter === pill.value;
                        return (
                            <UnstyledButton
                                key={pill.value}
                                h={40}
                                px={14}
                                fz={13}
                                fw={600}
                                c={active ? "var(--tx)" : "var(--tx2)"}
                                onClick={() =>
                                    dispatch({
                                        type: "SET_TYPE_FILTER",
                                        payload: pill.value,
                                    })
                                }
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 7,
                                    borderRadius: 14,
                                    whiteSpace: "nowrap",
                                    background: active
                                        ? "var(--sf)"
                                        : "transparent",
                                    boxShadow: active ? "var(--sh)" : "none",
                                    transition: "background 150ms",
                                }}
                            >
                                <TypeDot color={pill.dot} />
                                {pill.label}
                                <Text component="span" fz={11} c="var(--tx3)">
                                    {typeCounts[pill.value] ?? 0}
                                </Text>
                            </UnstyledButton>
                        );
                    })}
                    <DatePickerInput
                        type="range"
                        value={[dateFrom || null, dateTo || null]}
                        onChange={([from, to]) => {
                            dispatch({
                                type: "SET_DATE_FROM",
                                payload: from ?? "",
                            });
                            dispatch({
                                type: "SET_DATE_TO",
                                payload: to ?? "",
                            });
                        }}
                        leftSection={<CalendarDays size={15} />}
                        aria-label="Date range"
                        radius={14}
                        size="sm"
                        w={{ base: "100%", sm: 240 }}
                        valueFormat="MMM D, YYYY"
                        placeholder="Date range"
                        clearable
                        styles={{
                            input: {
                                height: 40,
                                backgroundColor: "var(--sf)",
                                borderColor: "transparent",
                            },
                        }}
                    />
                    {hasFilters && (
                        <Button
                            variant="subtle"
                            size="xs"
                            onClick={() => dispatch({ type: "RESET_FILTERS" })}
                        >
                            Clear filters
                        </Button>
                    )}
                    <SegmentedControl
                        ml="auto"
                        radius={14}
                        value={displayMode}
                        onChange={(value) =>
                            dispatch({
                                type: "SET_DISPLAY_MODE",
                                payload: value as DisplayMode,
                            })
                        }
                        styles={{
                            root: { backgroundColor: "var(--sf)" },
                            indicator: {
                                backgroundColor: "var(--sf2)",
                                borderRadius: 11,
                            },
                            label: { fontSize: 12, height: 34 },
                        }}
                        data={[
                            {
                                value: "whole",
                                label: (
                                    <Center style={{ gap: 6, height: "100%" }}>
                                        <CalendarDays size={14} />
                                        <Box component="span">By day</Box>
                                    </Center>
                                ),
                            },
                            {
                                value: "itemized",
                                label: (
                                    <Center style={{ gap: 6, height: "100%" }}>
                                        <UtensilsCrossed size={14} />
                                        <Box component="span">By food</Box>
                                    </Center>
                                ),
                            },
                        ]}
                    />
                    {displayMode === "whole" && (
                        <Group
                            gap={2}
                            p={3}
                            bg="var(--sf)"
                            style={{ borderRadius: 14 }}
                            role="radiogroup"
                            aria-label="Layout"
                        >
                            {LAYOUT_OPTIONS.map((option) => {
                                const active = layout === option.value;
                                const Icon = option.icon;
                                return (
                                    <Tooltip
                                        key={option.value}
                                        label={option.label}
                                    >
                                        <ActionIcon
                                            variant="transparent"
                                            size={34}
                                            radius={11}
                                            role="radio"
                                            aria-checked={active}
                                            aria-label={option.label}
                                            bg={
                                                active
                                                    ? "var(--sf2)"
                                                    : "transparent"
                                            }
                                            c={
                                                active
                                                    ? "var(--tx)"
                                                    : "var(--tx3)"
                                            }
                                            onClick={() =>
                                                setLayout(option.value)
                                            }
                                        >
                                            <Icon size={15} />
                                        </ActionIcon>
                                    </Tooltip>
                                );
                            })}
                        </Group>
                    )}
                </Group>
            </Paper>

            {/* Loading */}
            {isLoading && (
                <Box
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fill, minmax(min(420px, 100%), 1fr))",
                        gap: 12,
                    }}
                >
                    {Array.from({ length: 2 }).map((_, i) => (
                        <Paper key={i} p={16}>
                            <Group justify="space-between" px={6} pb={10}>
                                <Skeleton h={16} w={120} radius={999} />
                                <Skeleton h={12} w={60} radius={999} />
                            </Group>
                            <Stack gap={4}>
                                {Array.from({ length: 3 }).map((_, j) => (
                                    <Skeleton key={j} h={62} radius={16} />
                                ))}
                            </Stack>
                        </Paper>
                    ))}
                </Box>
            )}

            {/* Empty: no meals logged at all */}
            {hasNoData && (
                <Paper px={32} py={56}>
                    <Stack align="center" gap={12} ta="center">
                        <ThemeIcon size={64} radius={20}>
                            <History size={28} />
                        </ThemeIcon>
                        <Text
                            fz={22}
                            fw={700}
                            style={{ letterSpacing: "-0.025em" }}
                        >
                            Your history starts with one meal
                        </Text>
                        <Text fz={14} c="var(--tx2)" maw={400}>
                            Everything you log shows up here, grouped by day, so
                            you can find it, repeat it or edit it.
                        </Text>
                        <Button
                            component={Link}
                            href="/log"
                            mt={6}
                            size="md"
                            h={44}
                            leftSection={<Plus size={16} />}
                        >
                            Log your first meal
                        </Button>
                    </Stack>
                </Paper>
            )}

            {/* Empty: filters hide everything */}
            {nothingMatches && (
                <Paper px={32} py={56}>
                    <Stack align="center" gap={12} ta="center">
                        <ThemeIcon
                            size={64}
                            radius={20}
                            variant="filled"
                            color="gray"
                            styles={{
                                root: {
                                    backgroundColor: "var(--sf2)",
                                    color: "var(--tx3)",
                                },
                            }}
                        >
                            <SearchX size={28} />
                        </ThemeIcon>
                        <Text
                            fz={22}
                            fw={700}
                            style={{ letterSpacing: "-0.025em" }}
                        >
                            {search
                                ? `Nothing matches “${search}”`
                                : "Nothing matches these filters"}
                        </Text>
                        <Text fz={14} c="var(--tx2)">
                            Try another word, or look in every meal type.
                        </Text>
                        <Group gap={8} mt={6}>
                            <Button
                                size="sm"
                                h={40}
                                onClick={() =>
                                    dispatch({ type: "RESET_FILTERS" })
                                }
                            >
                                Clear search
                            </Button>
                            <Button
                                component={Link}
                                href="/log"
                                variant="default"
                                size="sm"
                                h={40}
                            >
                                Log it now
                            </Button>
                        </Group>
                    </Stack>
                </Paper>
            )}

            {/* Count + select all */}
            {!isLoading && !hasNoData && !nothingMatches && (
                <Group justify="space-between" px={6}>
                    <Text fz={12} c="var(--tx3)">
                        {selectedMealIds.size > 0
                            ? `${selectedMealIds.size} of ${filtered.length} meal${filtered.length !== 1 ? "s" : ""} selected`
                            : displayMode === "whole"
                              ? `${filtered.length} meal${filtered.length !== 1 ? "s" : ""}`
                              : `${itemizedRows.length} item${itemizedRows.length !== 1 ? "s" : ""}`}
                    </Text>
                    {displayMode === "whole" && (
                        <Checkbox
                            size="xs"
                            label="Select all"
                            checked={
                                filtered.length > 0 &&
                                selectedMealIds.size === filtered.length
                            }
                            indeterminate={
                                selectedMealIds.size > 0 &&
                                selectedMealIds.size < filtered.length
                            }
                            onChange={toggleSelectAll}
                            styles={{
                                label: {
                                    fontSize: 12,
                                    color: "var(--tx2)",
                                    fontWeight: 600,
                                },
                            }}
                        />
                    )}
                </Group>
            )}

            {/* By day */}
            {!isLoading &&
                !hasNoData &&
                !nothingMatches &&
                displayMode === "whole" &&
                (() => {
                    const days = (
                        <Box
                            style={{
                                display: "grid",
                                gridTemplateColumns: isGrid
                                    ? "repeat(auto-fill, minmax(min(420px, 100%), 1fr))"
                                    : "1fr",
                                gap: 12,
                                alignItems: "start",
                            }}
                        >
                            {dayGroups.map((group, groupIndex) => {
                                const kcal = group.meals.reduce(
                                    (sum, m) =>
                                        sum + (m.nutrition?.calories ?? 0),
                                    0
                                );
                                const body = (
                                    <>
                                        <Group
                                            justify="space-between"
                                            align="baseline"
                                            pt={2}
                                            px={6}
                                            pb={10}
                                        >
                                            <Box>
                                                <Text
                                                    component="span"
                                                    fw={700}
                                                    fz={16}
                                                >
                                                    {dayTitle(group.date)}
                                                </Text>
                                                <Text
                                                    component="span"
                                                    fz={12}
                                                    c="var(--tx3)"
                                                    ml={8}
                                                >
                                                    {formatShortDate(
                                                        group.date
                                                    )}
                                                </Text>
                                            </Box>
                                            <Text
                                                fz={12}
                                                c="var(--tx2)"
                                                style={{
                                                    fontVariantNumeric:
                                                        "tabular-nums",
                                                }}
                                            >
                                                <Text
                                                    component="span"
                                                    fw={700}
                                                    c="var(--tx)"
                                                >
                                                    {formatKcal(kcal)}
                                                </Text>{" "}
                                                kcal
                                            </Text>
                                        </Group>
                                        <Stack gap={4}>
                                            {group.meals.map(
                                                (meal: MealResponse) => {
                                                    const style = mealStyle(
                                                        meal.type
                                                    );
                                                    const Icon = style.icon;
                                                    const isSelected =
                                                        selectedMealIds.has(
                                                            meal.id
                                                        );
                                                    const time = meal.mealTime
                                                        ? formatTime(
                                                              new Date(
                                                                  meal.mealTime
                                                              )
                                                          )
                                                        : "";
                                                    const foodsLine = (
                                                        meal.items || []
                                                    )
                                                        .map((f) => f.foodName)
                                                        .join(", ");
                                                    return (
                                                        <Group
                                                            key={meal.id}
                                                            gap={12}
                                                            wrap="nowrap"
                                                            p={10}
                                                            style={{
                                                                borderRadius: 16,
                                                                background:
                                                                    isSelected
                                                                        ? "var(--acs)"
                                                                        : "transparent",
                                                                transition:
                                                                    "background 150ms",
                                                            }}
                                                        >
                                                            <Checkbox
                                                                size="22px"
                                                                checked={
                                                                    isSelected
                                                                }
                                                                onChange={() =>
                                                                    toggleMealSelection(
                                                                        meal.id
                                                                    )
                                                                }
                                                                aria-label="Select meal"
                                                                styles={{
                                                                    input: {
                                                                        borderWidth: 1.5,
                                                                        borderColor:
                                                                            isSelected
                                                                                ? "var(--ac)"
                                                                                : "var(--bd2)",
                                                                    },
                                                                }}
                                                            />
                                                            <UnstyledButton
                                                                onClick={() =>
                                                                    setSelected(
                                                                        meal
                                                                    )
                                                                }
                                                                style={{
                                                                    flex: 1,
                                                                    minWidth: 0,
                                                                }}
                                                            >
                                                                <Group
                                                                    gap={12}
                                                                    wrap="nowrap"
                                                                >
                                                                    <ThemeIcon
                                                                        color={
                                                                            style.color
                                                                        }
                                                                        size={
                                                                            42
                                                                        }
                                                                        radius={
                                                                            13
                                                                        }
                                                                    >
                                                                        <Icon
                                                                            size={
                                                                                17
                                                                            }
                                                                        />
                                                                    </ThemeIcon>
                                                                    <Box
                                                                        style={{
                                                                            flex: 1,
                                                                            minWidth: 0,
                                                                        }}
                                                                    >
                                                                        <Text
                                                                            fw={
                                                                                600
                                                                            }
                                                                            fz={
                                                                                14
                                                                            }
                                                                            truncate
                                                                        >
                                                                            {
                                                                                meal.title
                                                                            }
                                                                        </Text>
                                                                        <Text
                                                                            fz={
                                                                                12
                                                                            }
                                                                            c="var(--tx3)"
                                                                            mt={
                                                                                2
                                                                            }
                                                                            truncate
                                                                        >
                                                                            {[
                                                                                time,
                                                                                foodsLine,
                                                                            ]
                                                                                .filter(
                                                                                    Boolean
                                                                                )
                                                                                .join(
                                                                                    " · "
                                                                                )}
                                                                        </Text>
                                                                    </Box>
                                                                    <Stack
                                                                        gap={5}
                                                                        align="flex-end"
                                                                    >
                                                                        <Text
                                                                            fw={
                                                                                600
                                                                            }
                                                                            fz={
                                                                                13
                                                                            }
                                                                            style={{
                                                                                fontVariantNumeric:
                                                                                    "tabular-nums",
                                                                                whiteSpace:
                                                                                    "nowrap",
                                                                            }}
                                                                        >
                                                                            {meal
                                                                                .nutrition
                                                                                ?.calories
                                                                                ? `${formatKcal(meal.nutrition.calories)} kcal`
                                                                                : "—"}
                                                                        </Text>
                                                                        <MoodDots
                                                                            value={
                                                                                meal.mood
                                                                            }
                                                                        />
                                                                    </Stack>
                                                                </Group>
                                                            </UnstyledButton>
                                                        </Group>
                                                    );
                                                }
                                            )}
                                        </Stack>
                                    </>
                                );
                                const key = group.date.toDateString();
                                return isGrid ? (
                                    <Paper key={key} p={16}>
                                        {body}
                                    </Paper>
                                ) : (
                                    <Box key={key}>
                                        {groupIndex > 0 && <Divider mb={12} />}
                                        {body}
                                    </Box>
                                );
                            })}
                        </Box>
                    );
                    // The list is one card holding every day; the grid gives
                    // each day its own.
                    return isGrid ? days : <Paper p={16}>{days}</Paper>;
                })()}

            {/* By food */}
            {!isLoading &&
                !hasNoData &&
                !nothingMatches &&
                displayMode === "itemized" && (
                    <Paper p={10}>
                        <Table.ScrollContainer
                            minWidth={640}
                            maxHeight={tableMaxHeight}
                        >
                            <Table
                                layout="fixed"
                                withRowBorders={false}
                                horizontalSpacing={14}
                                verticalSpacing={10}
                                styles={{
                                    th: { paddingTop: 10, paddingBottom: 10 },
                                }}
                            >
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Food</Table.Th>
                                        <Table.Th w={110}>Amount</Table.Th>
                                        <Table.Th>Meal</Table.Th>
                                        <Table.Th w={120}>Date</Table.Th>
                                        <Table.Th w={80} ta="right">
                                            kcal
                                        </Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {itemizedRows.map(({ meal, food }) => {
                                        const style = mealStyle(meal.type);
                                        return (
                                            <Table.Tr
                                                key={`${meal.id}-${food.id}`}
                                                onClick={() =>
                                                    setSelected(meal)
                                                }
                                                style={{ cursor: "pointer" }}
                                            >
                                                <Table.Td>
                                                    <Text
                                                        fw={600}
                                                        fz={14}
                                                        truncate
                                                    >
                                                        {food.name}
                                                    </Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text
                                                        fz={14}
                                                        c="var(--tx2)"
                                                        style={{
                                                            fontVariantNumeric:
                                                                "tabular-nums",
                                                        }}
                                                    >
                                                        {food.quantity}{" "}
                                                        {food.unit}
                                                    </Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Group
                                                        gap={8}
                                                        wrap="nowrap"
                                                    >
                                                        <TypeDot
                                                            color={style.token}
                                                        />
                                                        <Text
                                                            fz={14}
                                                            c="var(--tx2)"
                                                            truncate
                                                        >
                                                            {meal.title}
                                                        </Text>
                                                    </Group>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text
                                                        fz={14}
                                                        c="var(--tx3)"
                                                    >
                                                        {meal.mealTime &&
                                                            formatShortDate(
                                                                new Date(
                                                                    meal.mealTime
                                                                )
                                                            )}
                                                    </Text>
                                                </Table.Td>
                                                <Table.Td ta="right">
                                                    <Text
                                                        fz={14}
                                                        style={{
                                                            fontVariantNumeric:
                                                                "tabular-nums",
                                                        }}
                                                    >
                                                        {formatKcal(
                                                            food.calories
                                                        )}
                                                    </Text>
                                                </Table.Td>
                                            </Table.Tr>
                                        );
                                    })}
                                </Table.Tbody>
                            </Table>
                        </Table.ScrollContainer>
                    </Paper>
                )}

            {/* Selection bar */}
            {selectedMealIds.size > 0 && (
                <Box
                    pos="sticky"
                    bottom={16}
                    style={{ alignSelf: "center", zIndex: 5 }}
                >
                    <Paper
                        radius={999}
                        bg="var(--tx)"
                        c="var(--bg)"
                        withBorder={false}
                        pl={18}
                        pr={8}
                        py={8}
                        style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.35)" }}
                    >
                        <Group gap={10} wrap="nowrap">
                            <Text
                                fz={14}
                                fw={700}
                                style={{ whiteSpace: "nowrap" }}
                            >
                                {selectedMealIds.size} selected
                            </Text>
                            <Button
                                variant="transparent"
                                size="sm"
                                onClick={() => setSelectedMealIds(new Set())}
                                styles={{
                                    root: { color: "var(--bg)", opacity: 0.7 },
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                px={16}
                                leftSection={<Trash2 size={14} />}
                                onClick={handleBulkDelete}
                                styles={{
                                    root: {
                                        backgroundColor: "#ff5c7f",
                                        color: "#fff",
                                        boxShadow: "none",
                                    },
                                }}
                            >
                                Delete
                            </Button>
                        </Group>
                    </Paper>
                </Box>
            )}

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
        </Stack>
    );
}
