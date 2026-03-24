import prisma from "@/lib/prisma/prisma";


export async function deleteMealEntryRepository(id: string) {
    return prisma.meal.delete({
        where: {
            id
        }
    })
}

