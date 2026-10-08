import { Paper, SimpleGrid, Text } from "@mantine/core";
import type { MealDraft } from "@/apis/meal/mutations";

type ExtractedMealIngredientsProps = {
    ingredients: MealDraft["ingredients"];
};

export function ExtractedMealIngredients({
    ingredients,
}: ExtractedMealIngredientsProps) {
    return (
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
            {ingredients.map((ingredient) => (
                <Paper
                    key={`${ingredient.name}-${ingredient.quantity}-${ingredient.unit}`}
                    radius="lg"
                    px="md"
                    py="md"
                    bg="var(--sf2)"
                    shadow="none"
                    withBorder={false}
                >
                    <Text fw={600} truncate>
                        {ingredient.name}
                    </Text>
                    <Text fz="xs" c="var(--tx3)" mt="xxs">
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
