import prisma from "@/lib/prisma/prisma";

export async function bulkDeleteMealEntriesRepository(ids: string[]) {
    return prisma.meal.deleteMany({
        where: {
            id: { in: ids }
        }
    });
}
