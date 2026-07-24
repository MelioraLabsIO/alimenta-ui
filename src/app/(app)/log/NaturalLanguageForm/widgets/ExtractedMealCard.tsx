import {CheckCircle2, Loader2, Pencil} from "lucide-react";
import {Badge, Button, Card, CardContent, CardHeader, CardTitle} from "@/components/mantine/ui";
import type {MealDraft} from "@/services/meal/mutations";
import {ExtractedMealIngredients} from "./ExtractedMealIngredients";
import {ExtractedMealTextList} from "./ExtractedMealTextList";

type ExtractedMealCardProps = {
    draft: MealDraft;
    isSaving: boolean;
    onConfirm: () => void;
    onEdit: () => void;
};

export function ExtractedMealCard({draft, isSaving, onConfirm, onEdit}: ExtractedMealCardProps) {
    return (
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

                <ExtractedMealIngredients ingredients={draft.ingredients}/>
                <ExtractedMealTextList title="Assumptions" items={draft.assumptions}/>
                <ExtractedMealTextList title="Clarification questions" items={draft.clarificationQuestions}/>

                <div className="flex gap-4 pt-1">
                    <Button onClick={onConfirm} disabled={isSaving} className="gap-2 flex-1 sm:flex-none">
                        {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <CheckCircle2 className="h-4 w-4 mr-2"/>}
                        {isSaving ? "Saving…" : "Confirm & Save"}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onEdit}
                        disabled={isSaving}
                        className="gap-4 flex-1 sm:flex-none"
                    >
                        <Pencil className="mr-2 h-4 w-4"/> Edit before saving
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

