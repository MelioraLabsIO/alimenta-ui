"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    fillWeekWithAi,
    newPlannedMealId,
    seedPlannedMeals,
    suggestTray,
} from "@/core/mock/planner";
import type {
    MealSuggestion,
    PlannedMeal,
    PlannerMap,
    PlannerSlot,
} from "@/core/types/models/planner";
import {
    addDays,
    fromDayKey,
    startOfDay,
    startOfWeek,
    toDayKey,
    weekDays,
} from "@/lib/planner-dates";
import { toast } from "@/lib/notifications";

export type PlannerView = "week" | "month";

export type MealDraft = {
    date: string;
    slot: PlannerSlot;
    name: string;
    kcal: number;
};

const FRESH_MS = 1200;

/**
 * Planner state, backed by mock data for now. Everything a server would own
 * (`plans`, the tray, "fill week") goes through this hook so swapping in
 * TanStack Query later only touches this file.
 *
 * The seed depends on the user's local "today", so it's created after mount
 * — rendering it on the server would use the server's timezone and mismatch
 * on hydration.
 */
export function usePlanner() {
    const [today, setToday] = useState<Date | null>(null);
    const [plans, setPlans] = useState<PlannerMap>({});
    const [selected, setSelected] = useState("");
    const [view, setView] = useState<PlannerView>("week");
    const [pickedId, setPickedId] = useState<string | null>(null);
    const [round, setRound] = useState(0);
    const [shuffling, setShuffling] = useState(false);
    const [filling, setFilling] = useState(false);
    const [freshIds, setFreshIds] = useState<Set<string>>(new Set());
    const freshTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => {
        const now = startOfDay(new Date());
        setToday(now);
        setSelected(toDayKey(now));
        setPlans(seedPlannedMeals(now));
    }, []);

    useEffect(() => () => clearTimeout(freshTimer.current), []);

    const selectedDate = useMemo(
        () => (selected ? fromDayKey(selected) : null),
        [selected]
    );

    const markFresh = useCallback((ids: string[]) => {
        setFreshIds(new Set(ids));
        clearTimeout(freshTimer.current);
        freshTimer.current = setTimeout(() => setFreshIds(new Set()), FRESH_MS);
    }, []);

    const updateDay = useCallback(
        (date: string, fn: (meals: PlannedMeal[]) => PlannedMeal[]) =>
            setPlans((prev) => ({ ...prev, [date]: fn(prev[date] ?? []) })),
        []
    );

    const addMeal = useCallback(
        (draft: MealDraft) => {
            const meal: PlannedMeal = {
                ...draft,
                id: newPlannedMealId(),
                status: "planned",
            };
            updateDay(draft.date, (meals) => [...meals, meal]);
            markFresh([meal.id]);
        },
        [updateDay, markFresh]
    );

    const editMeal = useCallback(
        (original: PlannedMeal, draft: MealDraft) => {
            const updated = { ...original, ...draft };
            setPlans((prev) => {
                const next = {
                    ...prev,
                    [original.date]: (prev[original.date] ?? []).filter(
                        (m) => m.id !== original.id
                    ),
                };
                next[draft.date] = [...(next[draft.date] ?? []), updated];
                return next;
            });
            markFresh([original.id]);
        },
        [markFresh]
    );

    const removeMeal = useCallback(
        (meal: PlannedMeal) => {
            updateDay(meal.date, (meals) =>
                meals.filter((m) => m.id !== meal.id)
            );
            toast.undo(`Removed ${meal.name}`);
        },
        [updateDay]
    );

    const toggleEaten = useCallback(
        (meal: PlannedMeal) =>
            updateDay(meal.date, (meals) =>
                meals.map((m) =>
                    m.id === meal.id
                        ? {
                              ...m,
                              status:
                                  m.status === "eaten" ? "planned" : "eaten",
                          }
                        : m
                )
            ),
        [updateDay]
    );

    const shift = useCallback(
        (dir: -1 | 1) => {
            if (!selectedDate) return;
            const next =
                view === "month"
                    ? new Date(
                          selectedDate.getFullYear(),
                          selectedDate.getMonth() + dir,
                          1
                      )
                    : addDays(selectedDate, 7 * dir);
            setSelected(toDayKey(next));
            setPickedId(null);
        },
        [selectedDate, view]
    );

    const goToday = useCallback(() => {
        if (!today) return;
        setSelected(toDayKey(today));
        setPickedId(null);
    }, [today]);

    /** Opens a day from the month grid in the week board. */
    const openDay = useCallback((date: string) => {
        setSelected(date);
        setView("week");
    }, []);

    const tray: MealSuggestion[] = useMemo(
        () =>
            selectedDate
                ? suggestTray(toDayKey(startOfWeek(selectedDate)), round)
                : [],
        [selectedDate, round]
    );
    const picked = tray.find((s) => s.id === pickedId) ?? null;

    const togglePick = useCallback(
        (id: string) => setPickedId((cur) => (cur === id ? null : id)),
        []
    );

    const placePicked = useCallback(
        (date: string) => {
            if (!picked) return;
            addMeal({
                date,
                slot: picked.slot,
                name: picked.name,
                kcal: picked.kcal,
            });
            setPickedId(null);
            setSelected(date);
        },
        [picked, addMeal]
    );

    const newIdeas = useCallback(() => {
        if (shuffling) return;
        setShuffling(true);
        // Simulated request latency for the AI suggestions.
        setTimeout(() => {
            setRound((r) => r + 1);
            setPickedId(null);
            setShuffling(false);
        }, 500);
    }, [shuffling]);

    const fillWeek = useCallback(() => {
        if (filling || !selectedDate || !today) return;
        setFilling(true);
        setTimeout(() => {
            const { plans: next, added } = fillWeekWithAi(
                plans,
                weekDays(selectedDate),
                today,
                round
            );
            setPlans(next);
            setFilling(false);
            markFresh(added.map((m) => m.id));
            if (added.length) {
                toast.success(
                    `Planned ${added.length} meal${added.length > 1 ? "s" : ""}`,
                    { description: "For the rest of this week" }
                );
            } else {
                toast.info("This week is already fully planned");
            }
        }, 1200);
    }, [filling, selectedDate, today, plans, round, markFresh]);

    return {
        ready: today !== null && selectedDate !== null,
        today: today ?? new Date(0),
        selected,
        selectedDate: selectedDate ?? new Date(0),
        plans,
        view,
        setView,
        select: setSelected,
        openDay,
        shift,
        goToday,
        freshIds,
        addMeal,
        editMeal,
        removeMeal,
        toggleEaten,
        tray,
        picked,
        togglePick,
        cancelPick: () => setPickedId(null),
        placePicked,
        shuffling,
        newIdeas,
        filling,
        fillWeek,
    };
}

export type PlannerState = ReturnType<typeof usePlanner>;
