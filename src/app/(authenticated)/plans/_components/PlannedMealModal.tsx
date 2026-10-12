"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Box,
    Button,
    Group,
    Modal,
    NumberInput,
    SegmentedControl,
    Stack,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import {
    plannedMealSchema,
    type PlannedMealInput,
    type PlannedMealSchema,
} from "@/contracts/planner/planned-meal.schema";
import {
    PLANNER_SLOTS,
    type PlannedMeal,
    type PlannerSlot,
} from "@/core/types/models/planner";
import { formatDayTitle, fromDayKey } from "@/lib/planner-dates";
import { SLOT_META } from "./planner-meta";
import type { MealDraft } from "./usePlanner";

export type MealEditorTarget =
    | { mode: "add"; date: string; slot: PlannerSlot }
    | { mode: "edit"; meal: PlannedMeal };

/** Add a meal to a day by hand, or edit one that's already planned. */
export function PlannedMealModal({
    target,
    onClose,
    onSubmit,
}: {
    target: MealEditorTarget | null;
    onClose: () => void;
    onSubmit: (target: MealEditorTarget, draft: MealDraft) => void;
}) {
    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PlannedMealInput, unknown, PlannedMealSchema>({
        resolver: zodResolver(plannedMealSchema),
    });

    useEffect(() => {
        if (!target) return;
        reset(
            target.mode === "edit"
                ? {
                      name: target.meal.name,
                      slot: target.meal.slot,
                      kcal: target.meal.kcal,
                  }
                : { name: "", slot: target.slot, kcal: "" }
        );
    }, [target, reset]);

    const date = target
        ? target.mode === "edit"
            ? target.meal.date
            : target.date
        : null;

    const submit = (values: PlannedMealSchema) => {
        if (!target || !date) return;
        onSubmit(target, {
            date,
            slot: values.slot as PlannerSlot,
            name: values.name,
            kcal: values.kcal,
        });
        onClose();
    };

    return (
        <Modal
            opened={target !== null}
            onClose={onClose}
            size={420}
            radius="xl"
            padding="xl"
            withCloseButton={false}
        >
            <Box component="form" onSubmit={handleSubmit(submit)} noValidate>
                <Stack gap="md">
                    <Box>
                        <Text fz="xs" c="var(--tx3)">
                            {date ? formatDayTitle(fromDayKey(date)) : ""}
                        </Text>
                        <Title order={3} lts="var(--ls-snug)">
                            {target?.mode === "edit"
                                ? "Edit meal"
                                : "Plan a meal"}
                        </Title>
                    </Box>

                    <Controller
                        control={control}
                        name="slot"
                        render={({ field }) => (
                            <SegmentedControl
                                fullWidth
                                radius="md"
                                value={field.value}
                                onChange={field.onChange}
                                data={PLANNER_SLOTS.map((slot) => ({
                                    value: slot,
                                    label: SLOT_META[slot].label,
                                }))}
                                styles={{
                                    label: {
                                        fontSize: "var(--mantine-font-size-xs)",
                                    },
                                }}
                            />
                        )}
                    />

                    <TextInput
                        label="Meal"
                        placeholder="e.g. Quinoa salad"
                        data-autofocus
                        error={errors.name?.message}
                        {...register("name")}
                    />

                    <Controller
                        control={control}
                        name="kcal"
                        render={({ field }) => (
                            <NumberInput
                                label="Estimated calories"
                                placeholder="e.g. 520"
                                suffix=" kcal"
                                min={0}
                                max={5000}
                                allowDecimal={false}
                                thousandSeparator=","
                                value={
                                    typeof field.value === "number" ||
                                    typeof field.value === "string"
                                        ? field.value
                                        : ""
                                }
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                error={errors.kcal?.message}
                            />
                        )}
                    />

                    <Group gap="sm" mt="xs" grow wrap="nowrap">
                        <Button
                            variant="default"
                            h={44}
                            radius="md"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" h={44} radius="md" fw={700}>
                            {target?.mode === "edit" ? "Save" : "Add to plan"}
                        </Button>
                    </Group>
                </Stack>
            </Box>
        </Modal>
    );
}
