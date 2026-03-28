import { getMeals } from "@/repositories/meals/get-meals";
import {createClient} from "@/lib/supabase/server";
import {Meal, MealItem, FoodItem} from "@/core/types";

export async function getAllMealsService(from?: Date, to?: Date): Promise<Meal[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const meals = await getMeals(user?.id, from, to);

    // Map database items to the expected unified frontend format
    return (meals as any[]).map(meal => {
        const items: MealItem[] = (meal.items || []).map((item: any) => ({
            id: item.id,
            mealId: item.mealId,
            catalogFoodId: item.catalogFoodId,
            quantity: Number(item.quantity),
            unit: item.unit,
            catalogFood: {
                id: item.catalogFood.id,
                name: item.catalogFood.name,
                calories: item.catalogFood.calories ? Number(item.catalogFood.calories) : null,
                protein: item.catalogFood.protein ? Number(item.catalogFood.protein) : null,
                carbs: item.catalogFood.carbs ? Number(item.catalogFood.carbs) : null,
                fat: item.catalogFood.fat ? Number(item.catalogFood.fat) : null,
            }
        }));

        // Calculate nutrition summary if macros are present
        const nutrition = items.reduce((acc, item) => {
            if (item.catalogFood) {
                const qty = item.quantity;
                acc.calories += (item.catalogFood.calories || 0) * (qty / 100); // assuming 100g/ml if unit not specified or g/ml
                acc.protein += (item.catalogFood.protein || 0) * (qty / 100);
                acc.carbs += (item.catalogFood.carbs || 0) * (qty / 100);
                acc.fat += (item.catalogFood.fat || 0) * (qty / 100);
            }
            return acc;
        }, {calories: 0, protein: 0, carbs: 0, fat: 0});

        const foods: FoodItem[] = items.map(item => ({
            id: item.id,
            name: item.catalogFood.name,
            quantity: item.quantity,
            unit: item.unit,
            catalogFood: item.catalogFood
        }));

        return {
            id: meal.id,
            userId: meal.userId,
            title: meal.title,
            type: meal.type,
            foodTime: meal.foodTime,
            notes: meal.notes,
            mood: meal.mood,
            energy: meal.energy,
            digestion: meal.digestion,
            items: items,
            foods: foods,
            metrics: {
                mood: meal.mood,
                energy: meal.energy,
                digestion: meal.digestion,
                notes: meal.notes || undefined
            },
            createdAt: meal.createdAt,
            updatedAt: meal.updatedAt,
            nutrition: nutrition
        } as Meal;
    });
}