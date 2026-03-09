import prisma from "@/lib/prisma/prisma";

export function getMealEntries() {
    return prisma.mealEntry.findMany();
}