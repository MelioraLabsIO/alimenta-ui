import {useState} from "react";
import {EMealType, EMealUnit} from "@/core/types/models/meal";
import type {Meal} from "@/core/types/models/meal";
import {extractMeal, saveMeal} from "@/services/meal/mutations";
import type {MealDraft} from "@/services/meal/mutations";
import {toast} from "@/lib/notifications";
import {Button} from "@/components/mantine/ui";
import {Text} from "@/components/mantine/ui";
import {Textarea} from "@/components/mantine/ui";
import {CheckCircle2, Loader2, Pencil, Sparkles} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/mantine/ui";
import {Badge} from "@/components/mantine/ui";
import {ManualForm} from "@/app/(app)/log/ManualForm";
import type {SaveMealDTO} from "@/core/types/dto";

type NaturalLanguageMealItem = SaveMealDTO["items"][number] & {
    foodName: string;
};

function uid() {
    return Math.random().toString(36).slice(2, 10);
}

function toMealType(value: string): EMealType {
    const normalized = value.trim().toUpperCase();
    return Object.values(EMealType).find((type) => type === normalized) ?? EMealType.OTHER;
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

    return Object.values(EMealUnit).find((unit) => unit.toLowerCase() === normalized) ?? EMealUnit.UNIT;
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

export function NaturalLanguageForm({onSuccess}: { onSuccess?: () => void }) {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [draft, setDraft] = useState<MealDraft | null>(null);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);
    const [editMode, setEditMode] = useState(false);

    async function handleAnalyze() {
        if (text.trim().length < 5) {
            setError("Please describe your meal in a bit more detail.");
            return;
        }
        setError("");
        setLoading(true);
        setDraft(null);
        setSaved(false);
        try {
            const result = await extractMeal(text);
            setDraft(result);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Extraction failed.");
        } finally {
            setLoading(false);
        }
    }

    async function handleConfirm() {
        if (!draft) return;
        try {
            await saveMeal({
                title: draft.mealName,
                type: toMealType(draft.mealType),
                mealTime: new Date(),
                items: draftItems(draft),
                mood: 3,
                energy: 3,
                digestion: 3,
                likeness: 3,
                notes: draft.assumptions.join("\n"),
            });
            toast.success("Meal saved!", {description: draft.mealName});
            setSaved(true);
            setDraft(null);
            setText("");
            if (onSuccess) {
                onSuccess();
            }
        } catch (e) {
            console.error("Error saving meal:", e);
            toast.error("Failed to save meal. Please try again.");
        }
    }

    if (editMode && draft) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditMode(false)} className="gap-1.5 text-xs">
                        ← Back to preview
                    </Button>
                </div>
                <ManualForm
                    onSuccess={onSuccess}
                    prefill={draftPrefill(draft)}
                />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="space-y-1.5">
                <Text>Describe your meal</Text>
                <Textarea
                    id="nl-input"
                    placeholder="e.g. I had a big bowl of oatmeal with banana and almond milk for breakfast, plus a black coffee"
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        setError("");
                    }}
                    rows={4}
                    className={error ? "border-destructive" : ""}
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            <Button onClick={handleAnalyze} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4"/>}
                {loading ? "Extracting…" : "Extract Meal"}
            </Button>

            {saved && (
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                    <CheckCircle2 className="h-4 w-4"/> Meal saved successfully!
                </div>
            )}

            {draft && (
                <Card className="border-emerald-500/20 bg-card/60">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold">Extracted Meal</CardTitle>
                            <Badge
                                variant="outline"
                                className="border-emerald-500/30 text-xs text-emerald-400"
                            >
                                {draft.mealType || "Other"}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Title</p>
                            <p className="text-sm font-medium">{draft.mealName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Ingredients detected</p>
                            <div className="space-y-1">
                                {draft.ingredients.map((ingredient) => (
                                    <div
                                        key={`${ingredient.name}-${ingredient.quantity}-${ingredient.unit}`}
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"/>
                                        <span>{ingredient.name}</span>
                                        <span className="text-muted-foreground">
                                            {ingredient.quantity ?? "unspecified"} {ingredient.unit ?? ""}
                                        </span>
                                        {ingredient.preparation && (
                                            <span className="text-muted-foreground">({ingredient.preparation})</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        {draft.assumptions.length > 0 && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-2">Assumptions</p>
                                <div className="space-y-1">
                                    {draft.assumptions.map((assumption) => (
                                        <p key={assumption} className="text-sm text-muted-foreground">{assumption}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                        {draft.clarificationQuestions.length > 0 && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-2">Clarification questions</p>
                                <div className="space-y-1">
                                    {draft.clarificationQuestions.map((question) => (
                                        <p key={question} className="text-sm text-muted-foreground">{question}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="flex gap-2 pt-1">
                            <Button onClick={handleConfirm} className="gap-2 flex-1 sm:flex-none">
                                <CheckCircle2 className="h-4 w-4"/> Confirm & Save
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setEditMode(true)}
                                className="gap-2 flex-1 sm:flex-none"
                            >
                                <Pencil className="h-4 w-4"/> Edit before saving
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
