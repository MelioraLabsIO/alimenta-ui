import prisma from "@/lib/prisma/prisma";

export function getMeals() {
    return prisma.meal.findMany();
}