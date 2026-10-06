import { Paper, SimpleGrid, Text } from "@mantine/core";
import type { MealDraft } from "@/apis/meal/mutations";

type ExtractedMealIngredientsProps = {
    ingredients: MealDraft["ingredients"];
};

export function ExtractedMealIngredients({
    ingredients,
}: ExtractedMealIngredientsProps) {
    return (
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={8}>
            {ingredients.map((ingredient) => (
                <Paper
                    key={`${ingredient.name}-${ingredient.quantity}-${ingredient.unit}`}
                    radius={16}
                    px={14}
                    py={12}
                    bg="var(--sf2)"
                    shadow="none"
                    withBorder={false}
                >
                    <Text fw={600} truncate>
                        {ingredient.name}
                    </Text>
                    <Text fz={12} c="var(--tx3)" mt={3}>
                        {ingredient.quantity ?? "unspecified"}{" "}
                        {ingredient.unit ?? ""}
                        {ingredient.preparation
                            ? ` (${ingredient.preparation})`
                            : ""}
                    </Text>
                </Paper>
            ))}
        </SimpleGrid>
    );
}
