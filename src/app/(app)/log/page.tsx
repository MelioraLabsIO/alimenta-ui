"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { mealsRepo } from "@/core/meals/mealsRepo";
import { analyzeMeal } from "@/core/analyze/analyzeMeal";
import { Meal, FoodItem, MealType, ParsedMeal } from "@/core/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Loader2, Sparkles, CheckCircle2, Pencil } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type FoodRow = { id: string; name: string; quantity: string; unit: string };

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function emptyFood(): FoodRow {
  return { id: uid(), name: "", quantity: "1", unit: "g" };
}

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack", "other"];
const UNITS = ["g", "ml", "oz", "cup", "tbsp", "tsp", "piece", "slice", "serving", "whole", "large", "medium", "small"];

// ─── Manual Form ─────────────────────────────────────────────────────────────

function ManualForm({ prefill }: { prefill?: Partial<Meal> }) {
  const router = useRouter();
  const [title, setTitle] = useState(prefill?.title ?? "");
  const [date, setDate] = useState(
    prefill?.date
      ? new Date(prefill.date).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [mealType, setMealType] = useState<MealType>(prefill?.mealType ?? "lunch");
  const [foods, setFoods] = useState<FoodRow[]>(
    prefill?.foods?.map((f) => ({ ...f, quantity: String(f.quantity) })) ?? [emptyFood()]
  );
  const [calories, setCalories] = useState(String(prefill?.nutrition?.calories ?? ""));
  const [protein, setProtein] = useState(String(prefill?.nutrition?.protein ?? ""));
  const [carbs, setCarbs] = useState(String(prefill?.nutrition?.carbs ?? ""));
  const [fat, setFat] = useState(String(prefill?.nutrition?.fat ?? ""));
  const [mood, setMood] = useState(prefill?.metrics?.mood ?? 3);
  const [energy, setEnergy] = useState(prefill?.metrics?.energy ?? 3);
  const [digestion, setDigestion] = useState(prefill?.metrics?.digestion ?? 3);
  const [notes, setNotes] = useState(prefill?.metrics?.notes ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function addFood() {
    setFoods((f) => [...f, emptyFood()]);
  }

  function removeFood(id: string) {
    setFoods((f) => f.filter((r) => r.id !== id));
  }

  function updateFood(id: string, field: keyof FoodRow, value: string) {
    setFoods((f) => f.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    if (!date) e.date = "Date is required";
    if (foods.some((f) => !f.name.trim())) e.foods = "All food items need a name";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    mealsRepo.create({
      title: title.trim(),
      mealType,
      date: new Date(date).toISOString(),
      foods: foods.map((f) => ({
        id: f.id,
        name: f.name.trim(),
        quantity: parseFloat(f.quantity) || 1,
        unit: f.unit,
      })),
      nutrition: {
        calories: calories ? parseInt(calories) : undefined,
        protein: protein ? parseFloat(protein) : undefined,
        carbs: carbs ? parseFloat(carbs) : undefined,
        fat: fat ? parseFloat(fat) : undefined,
      },
      metrics: { mood, energy, digestion, notes: notes.trim() || undefined },
    });
    toast.success("Meal logged!", { description: title });
    // Reset
    setTitle(""); setDate(new Date().toISOString().slice(0, 16));
    setMealType("lunch"); setFoods([emptyFood()]);
    setCalories(""); setProtein(""); setCarbs(""); setFat("");
    setMood(3); setEnergy(3); setDigestion(3); setNotes("");
  }

  const sliderLabel = (v: number) => ["", "Poor", "Fair", "Okay", "Good", "Great"][v] ?? "";

  return (
    <div className="space-y-6">
      {/* Basic info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">Meal title <span className="text-destructive">*</span></Label>
          <Input
            id="title"
            placeholder="e.g. Avocado Toast & Eggs"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={errors.title ? "border-destructive" : ""}
          />
          {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="date">Date & time <span className="text-destructive">*</span></Label>
          <Input
            id="date"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={errors.date ? "border-destructive" : ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Meal type</Label>
          <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MEAL_TYPES.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Foods */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Foods <span className="text-destructive">*</span></Label>
          <Button variant="outline" size="sm" onClick={addFood} className="gap-1.5 h-7 text-xs">
            <Plus className="h-3 w-3" /> Add food
          </Button>
        </div>
        {errors.foods && <p className="text-xs text-destructive">{errors.foods}</p>}
        <div className="space-y-2">
          {foods.map((food) => (
            <div key={food.id} className="flex gap-2 items-center">
              <Input
                placeholder="Food name"
                value={food.name}
                onChange={(e) => updateFood(food.id, "name", e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Qty"
                value={food.quantity}
                onChange={(e) => updateFood(food.id, "quantity", e.target.value)}
                className="w-20"
                type="number"
                min={0}
              />
              <Select value={food.unit} onValueChange={(v) => updateFood(food.id, "unit", v)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => removeFood(food.id)}
                disabled={foods.length === 1}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Macros */}
      <div className="space-y-3">
        <Label className="text-muted-foreground text-xs uppercase tracking-wide">Optional macros</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Calories (kcal)", value: calories, set: setCalories },
            { label: "Protein (g)", value: protein, set: setProtein },
            { label: "Carbs (g)", value: carbs, set: setCarbs },
            { label: "Fat (g)", value: fat, set: setFat },
          ].map(({ label, value, set }) => (
            <div key={label} className="space-y-1.5">
              <Label className="text-xs">{label}</Label>
              <Input
                type="number"
                min={0}
                placeholder="—"
                value={value}
                onChange={(e) => set(e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Journal */}
      <div className="space-y-4">
        <Label className="text-muted-foreground text-xs uppercase tracking-wide">How did you feel?</Label>
        {[
          { label: "Mood", value: mood, set: setMood },
          { label: "Energy", value: energy, set: setEnergy },
          { label: "Digestion", value: digestion, set: setDigestion },
        ].map(({ label, value, set }) => (
          <div key={label} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">{label}</Label>
              <span className="text-xs text-muted-foreground">{sliderLabel(value)}</span>
            </div>
            <Slider
              min={1} max={5} step={1}
              value={[value]}
              onValueChange={([v]) => set(v)}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
              {[1,2,3,4,5].map((n) => <span key={n}>{n}</span>)}
            </div>
          </div>
        ))}
        <div className="space-y-1.5">
          <Label className="text-sm">Notes</Label>
          <Textarea
            placeholder="How did this meal make you feel? Any observations…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <Button onClick={handleSave} className="w-full sm:w-auto">
        Save Meal
      </Button>
    </div>
  );
}

// ─── NL Form ─────────────────────────────────────────────────────────────────

function NaturalLanguageForm() {
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
      const result = await analyzeMeal({ text });
      setParsed(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleConfirm() {
    if (!parsed) return;
    mealsRepo.create({
      title: parsed.title,
      mealType: "other",
      date: new Date().toISOString(),
      foods: parsed.foods,
      nutrition: parsed.nutrition,
    });
    toast.success("Meal saved!", { description: parsed.title });
    setSaved(true);
    setParsed(null);
    setText("");
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
          prefill={{
            title: parsed.title,
            foods: parsed.foods,
            nutrition: parsed.nutrition,
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="nl-input">Describe your meal</Label>
        <Textarea
          id="nl-input"
          placeholder="e.g. I had a big bowl of oatmeal with banana and almond milk for breakfast, plus a black coffee"
          value={text}
          onChange={(e) => { setText(e.target.value); setError(""); }}
          rows={4}
          className={error ? "border-destructive" : ""}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <Button onClick={handleAnalyze} disabled={loading} className="gap-2">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {loading ? "Analyzing…" : "Analyze Meal"}
      </Button>

      {saved && (
        <div className="flex items-center gap-2 text-sm text-emerald-400">
          <CheckCircle2 className="h-4 w-4" /> Meal saved successfully!
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
                {parsed.foods.map((f) => (
                  <div key={f.id} className="flex items-center gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>{f.name}</span>
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
                    { label: "Calories", value: parsed.nutrition.calories, unit: "kcal" },
                    { label: "Protein", value: parsed.nutrition.protein, unit: "g" },
                    { label: "Carbs", value: parsed.nutrition.carbs, unit: "g" },
                    { label: "Fat", value: parsed.nutrition.fat, unit: "g" },
                  ].map(({ label, value, unit }) => (
                    <div key={label} className="rounded-lg bg-muted/50 p-2 text-center">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-semibold">{value ?? "—"}<span className="text-xs font-normal text-muted-foreground ml-0.5">{unit}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <Button onClick={handleConfirm} className="gap-2 flex-1 sm:flex-none">
                <CheckCircle2 className="h-4 w-4" /> Confirm & Save
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditMode(true)}
                className="gap-2 flex-1 sm:flex-none"
              >
                <Pencil className="h-4 w-4" /> Edit before saving
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LogMealPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Log Meal</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Add a meal manually or describe it in plain language.
        </p>
      </div>

      <Tabs defaultValue="manual">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="manual" className="flex-1 sm:flex-none">Manual</TabsTrigger>
          <TabsTrigger value="natural" className="flex-1 sm:flex-none">Natural Language</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-6">
          <Card className="border-border/50 bg-card/60">
            <CardContent className="p-6">
              <ManualForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="natural" className="mt-6">
          <Card className="border-border/50 bg-card/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                AI-Powered Parsing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NaturalLanguageForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
