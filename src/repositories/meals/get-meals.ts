import prisma from "@/lib/prisma/prisma";

export function getMeals(userId?: string, from?: Date, to?: Date) {
    return prisma.meal.findMany({
        where: {
            userId: userId,
            foodTime: {
                gte: from,
                lte: to,
            },
        },
    });
}