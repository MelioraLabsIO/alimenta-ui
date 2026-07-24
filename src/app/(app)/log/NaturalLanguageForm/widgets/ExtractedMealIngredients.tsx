import type {MealDraft} from "@/services/meal/mutations";

type ExtractedMealIngredientsProps = {
    ingredients: MealDraft["ingredients"];
};

export function ExtractedMealIngredients({ingredients}: ExtractedMealIngredientsProps) {
    return (
        <div>
            <p className="text-xs text-muted-foreground mb-2">Ingredients detected</p>
            <div className="space-y-1">
                {ingredients.map((ingredient) => (
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
    );
}

