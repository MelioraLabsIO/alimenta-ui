import prisma from "@/lib/prisma/prisma";

export function getUserProfile(userId: string) {
    return prisma.profile.findUnique({
        where: {
            id: userId,
        }
    });
}
