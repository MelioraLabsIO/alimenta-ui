import prisma from "@/lib/prisma/prisma";

export async function getMeals() {
    return await prisma.mealEntry.findMany();
}
