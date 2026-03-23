import {MealFormValues} from "@/core/meals/types";
import prisma from "@/lib/prisma/prisma";


export async function createMealEntryRepository(meal: MealFormValues, userId: string) {
    return prisma.meal.create({

        data: {
            userId,
            title: meal.title,
            type: "DINNER",
            notes: meal.notes,
            mood: Math.round(Number(meal.mood)) || 0,
            energy: Math.round(Number(meal.energy)) || 0,
            digestion: Math.round(Number(meal.digestion)) || 0,
            foodTime: new Date(meal.date),

            items: {
                create: (meal.foods || []).map(food => {
                    const isUUID = food.id && food.id.length === 36;
                    const catalogFoodData: any = isUUID ? {
                        connect: { id: food.id }
                    } : {
                        create: {
                            name: food.name || "Unknown Food",
                        }
                    };
                    return {
                        catalogFood: catalogFoodData,
                        quantity: Number(food.quantity) || 0,
                        unit: food.unit || "unit",
                    };
                })
            }
        }
    })
}

