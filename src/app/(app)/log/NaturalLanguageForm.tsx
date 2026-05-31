import {useState} from "react";
import {EMealType, ParsedMeal} from "@/core/types/models/meal";
import {analyzeMeal, saveMeal} from "@/services/meal/mutations";
import {toast} from "@/lib/notifications";
import {Button} from "@/components/mantine/ui";
import {Text} from "@/components/mantine/ui";
import {Textarea} from "@/components/mantine/ui";
import {CheckCircle2, Loader2, Pencil, Sparkles} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/mantine/ui";
import {Badge} from "@/components/mantine/ui";
import {ManualForm} from "@/app/(app)/log/ManualForm";

export function NaturalLanguageForm({onSuccess}: { onSuccess?: () => void }) {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [parsed, setParsed] = useState<ParsedMeal | null>(null);
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
        setParsed(null);
        setSaved(false);
        try {
            const result = await analyzeMeal({text});
            setParsed(result);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Analysis failed.");
        } finally {
            setLoading(false);
        }
    }

    async function handleConfirm() {
        if (!parsed) return;
        try {
            await saveMeal({
                title: parsed.title,
                type: EMealType.OTHER,
                mealTime: new Date(),
                items: [], // parsed.items.map(f => ({ ...f, quantity: f.quantity })),
                mood: 3,
                energy: 3,
                digestion: 3,
                likeness: 3,
                notes: "",
            });
            toast.success("Meal saved!", {description: parsed.title});
            setSaved(true);
            setParsed(null);
            setText("");
            if (onSuccess) {
                onSuccess();
            }
        } catch (e) {
            console.error("Error saving meal:", e);
            toast.error("Failed to save meal. Please try again.");
        }
    }

    if (editMode && parsed) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditMode(false)} className="gap-1.5 text-xs">
                        ← Back to preview
                    </Button>
                </div>
                <ManualForm
                    onSuccess={onSuccess}
                    prefill={{
                        title: parsed.title,
                        nutrition: parsed.nutrition,
                    }}
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
                {loading ? "Analyzing…" : "Analyze Meal"}
            </Button>

            {saved && (
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                    <CheckCircle2 className="h-4 w-4"/> Meal saved successfully!
                </div>
            )}

            {parsed && (
                <Card className="border-emerald-500/20 bg-card/60">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold">Parsed Result</CardTitle>
                            <Badge
                                variant="outline"
                                className={`text-xs ${
                                    parsed.confidence >= 0.7
                                        ? "border-emerald-500/30 text-emerald-400"
                                        : parsed.confidence >= 0.5
                                            ? "border-yellow-500/30 text-yellow-400"
                                            : "border-red-500/30 text-red-400"
                                }`}
                            >
                                {Math.round(parsed.confidence * 100)}% confidence
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Title</p>
                            <p className="text-sm font-medium">{parsed.title}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Foods detected</p>
                            <div className="space-y-1">
                                {parsed.items.map((f) => (
                                    <div key={f.id} className="flex items-center gap-2 text-sm">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"/>
                                        <span>{f.catalogFood?.name}</span>
                                        <span className="text-muted-foreground">{f.quantity} {f.unit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {parsed.nutrition && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-2">Estimated nutrition</p>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        {label: "Calories", value: parsed.nutrition.calories, unit: "kcal"},
                                        {label: "Protein", value: parsed.nutrition.protein, unit: "g"},
                                        {label: "Carbs", value: parsed.nutrition.carbs, unit: "g"},
                                        {label: "Fat", value: parsed.nutrition.fat, unit: "g"},
                                    ].map(({label, value, unit}) => (
                                        <div key={label} className="rounded-lg bg-muted/50 p-2 text-center">
                                            <p className="text-xs text-muted-foreground">{label}</p>
                                            <p className="text-sm font-semibold">{value ?? "—"}<span
                                                className="text-xs font-normal text-muted-foreground ml-0.5">{unit}</span>
                                            </p>
                                        </div>
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
