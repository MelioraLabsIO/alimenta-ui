import prisma from "@/lib/prisma/prisma";

export async function updateUserProfile(userId: string, data: { firstName: string; lastName: string }) {
    return prisma.profile.update({
        where: {
            id: userId,
        },
        data,
    });
}
