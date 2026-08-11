import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { EMealType, EMealUnit } from "@/core/types/models/meal";
import type { Meal } from "@/core/types/models/meal";
import { extractMeal, saveMeal } from "@/apis/meal/mutations";
import type { MealDraft } from "@/apis/meal/mutations";
import { toast } from "@/lib/notifications";
import type { SaveMealDTO } from "@/core/types/dto";
import { BackToPreviewButton } from "./widgets/BackToPreviewButton";
import { ExtractedMealCard } from "./widgets/ExtractedMealCard";
import { NaturalLanguageInputSection } from "./widgets/NaturalLanguageInputSection";
import { SaveSuccessMessage } from "./widgets/SaveSuccessMessage";
import { ManualForm } from "@/app/(authenticated)/log/ManualForm/ManualForm";

type NaturalLanguageMealItem = SaveMealDTO["items"][number] & {
    foodName: string;
};

function uid() {
    return Math.random().toString(36).slice(2, 10);
}

function toMealType(value: string): EMealType {
    const normalized = value.trim().toUpperCase();
    return (
        Object.values(EMealType).find((type) => type === normalized) ??
        EMealType.OTHER
    );
}

function toMealUnit(value: string | null): EMealUnit {
    if (!value) {
        return EMealUnit.UNIT;
    }

    const normalized = value.trim().toLowerCase();
    const aliases: Record<string, EMealUnit> = {
        gram: EMealUnit.GRAM,
        grams: EMealUnit.GRAM,
        milliliter: EMealUnit.ML,
        milliliters: EMealUnit.ML,
        ounce: EMealUnit.OZ,
        ounces: EMealUnit.OZ,
        pound: EMealUnit.LB,
        pounds: EMealUnit.LB,
        tablespoon: EMealUnit.TABLESPOON,
        tablespoons: EMealUnit.TABLESPOON,
        teaspoon: EMealUnit.TEASPOON,
        teaspoons: EMealUnit.TEASPOON,
        pieces: EMealUnit.PIECE,
        slices: EMealUnit.SLICE,
        servings: EMealUnit.SERVING,
    };

    if (aliases[normalized]) {
        return aliases[normalized];
    }

    return (
        Object.values(EMealUnit).find(
            (unit) => unit.toLowerCase() === normalized
        ) ?? EMealUnit.UNIT
    );
}

function draftItems(draft: MealDraft): NaturalLanguageMealItem[] {
    return draft.ingredients.map((ingredient) => ({
        foodSource: "custom",
        foodSourceId: uid(),
        foodName: ingredient.name,
        quantity: ingredient.quantity ?? 1,
        unit: toMealUnit(ingredient.unit),
    }));
}

function draftPrefill(draft: MealDraft): Partial<Meal> {
    return {
        title: draft.mealName,
        type: toMealType(draft.mealType),
        items: draftItems(draft).map((item) => ({
            id: item.foodSourceId,
            mealId: "",
            foodSource: item.foodSource,
            foodSourceId: item.foodSourceId,
            foodName: item.foodName,
            quantity: item.quantity,
            unit: item.unit,
            nutrition: {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        })),
    };
}

export function NaturalLanguageForm({ onSuccess }: { onSuccess?: () => void }) {
    const queryClient = useQueryClient();
    const pathname = usePathname();
    const [text, setText] = useState("");
    const [error, setError] = useState("");
    const [editMode, setEditMode] = useState(false);
    const isHistoryPage = pathname === "/history";

    const {
        data: draft,
        mutate: mutateExtractMeal,
        isPending: isExtracting,
        reset: resetExtractMeal,
    } = useMutation({
        mutationKey: ["extract-meal"],
        mutationFn: extractMeal,
        onError: (mutationError) => {
            setError(
                mutationError instanceof Error
                    ? mutationError.message
                    : "Extraction failed."
            );
        },
    });

    const {
        mutate: mutateSaveMeal,
        isPending: isSaving,
        isSuccess: saved,
        reset: resetSaveMeal,
    } = useMutation({
        mutationKey: ["save-meal-from-natural-language"],
        mutationFn: async (currentDraft: MealDraft) => {
            return saveMeal({
                title: currentDraft.mealName,
                type: toMealType(currentDraft.mealType),
                mealTime: new Date(),
                items: draftItems(currentDraft),
                mood: 3,
                energy: 3,
                digestion: 3,
                likeness: 3,
                notes: currentDraft.assumptions.join("\n"),
            });
        },
        onSuccess: async (_, currentDraft) => {
            if (isHistoryPage) {
                toast.success("Meal saved!", {
                    description: currentDraft.mealName,
                });
            } else {
                toast.success("Meal saved!", {
                    description: (
                        <span>
                            {currentDraft.mealName}. You can view your newly
                            created meal{" "}
                            <Link
                                href="/history"
                                className="font-medium underline underline-offset-2"
                            >
                                here
                            </Link>
                            .
                        </span>
                    ),
                });
            }
            resetExtractMeal();
            setText("");
            setEditMode(false);
            await queryClient.invalidateQueries({ queryKey: ["meals"] });
            onSuccess?.();
        },
        onError: (mutationError) => {
            console.error("Error saving meal:", mutationError);
            toast.error("Failed to save meal. Please try again.");
        },
    });

    async function handleAnalyze() {
        if (text.trim().length < 5) {
            setError("Please describe your meal in a bit more detail.");
            return;
        }

        setError("");
        resetSaveMeal();
        resetExtractMeal();
        mutateExtractMeal(text.trim());
    }

    function handleConfirm() {
        if (!draft) {
            return;
        }

        mutateSaveMeal(draft);
    }

    if (editMode && draft) {
        return (
            <div className="space-y-4">
                <BackToPreviewButton onBack={() => setEditMode(false)} />
                <ManualForm
                    onSuccess={onSuccess}
                    prefill={draftPrefill(draft)}
                />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <NaturalLanguageInputSection
                text={text}
                error={error}
                isExtracting={isExtracting}
                onAnalyze={handleAnalyze}
                onTextChange={(nextValue: string) => {
                    setText(nextValue);
                    setError("");
                }}
            />

            {saved && <SaveSuccessMessage />}

            {draft && (
                <ExtractedMealCard
                    draft={draft}
                    isSaving={isSaving}
                    onConfirm={handleConfirm}
                    onEdit={() => setEditMode(true)}
                />
            )}
        </div>
    );
}
