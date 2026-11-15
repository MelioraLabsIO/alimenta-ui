"use client";

import { Stack } from "@mantine/core";
import { CookMode } from "./_components/CookMode";
import { DiscardConfirmModal } from "./_components/DiscardConfirmModal";
import { DiscoverView } from "./_components/DiscoverView";
import { ImportSheet } from "./_components/ImportSheet";
import { RecipeDetail } from "./_components/RecipeDetail";
import { RecipeGrid } from "./_components/RecipeGrid";
import { RecipesToolbar } from "./_components/RecipesToolbar";
import { ShareModal } from "./_components/ShareModal";
import { useRecipes } from "./_components/useRecipes";

export default function RecipesPage() {
    const recipes = useRecipes();

    return (
        <>
            {recipes.cooking ? (
                <CookMode recipes={recipes} />
            ) : (
                <Stack gap="md">
                    <RecipesToolbar recipes={recipes} />
                    {recipes.view === "recipe" ? (
                        <RecipeDetail recipes={recipes} />
                    ) : recipes.isDiscover ? (
                        <DiscoverView recipes={recipes} />
                    ) : (
                        <RecipeGrid recipes={recipes} />
                    )}
                </Stack>
            )}

            <ShareModal recipes={recipes} />
            <ImportSheet recipes={recipes} />
            <DiscardConfirmModal recipes={recipes} />
        </>
    );
}
