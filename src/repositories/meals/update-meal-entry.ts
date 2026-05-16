import {MealFormValues} from "@/services/meal/types";
import prisma from "@/lib/prisma/prisma";

export async function updateMealEntryRepository(mealId: string, meal: MealFormValues, userId: string) {
    // First, delete all existing meal items
    await prisma.mealItem.deleteMany({
        where: { mealId }
    });

    // Then update the meal and create new items
    return prisma.meal.update({
        where: { id: mealId, userId },
        data: {
            title: meal.title,
            type: meal.mealType,
            notes: meal.notes,
            mood: meal.mood || 0,
            energy: meal.energy || 0,
            digestion: meal.digestion || 0,
            likeness: meal.likeness ?? 3,
            foodTime: new Date(meal.date),
            items: {
                create: (meal.foods || []).map(food => {
                    const isUUID = food.id && food.id.length === 36 && food.id.includes("-");
                    return {
                        catalogFood: isUUID ? {
                            connect: { id: food.id }
                        } : {
                            create: {
                                name: food.name || "Unknown Food",
                            }
                        },
                        quantity: Number(food.quantity) || 0,
                        unit: food.unit || "unit",
                    };
                })
            }
        },
        include: {
            items: {
                include: {
                    catalogFood: true,
                },
            },
        },
    });
}
