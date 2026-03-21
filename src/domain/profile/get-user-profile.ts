import { getUserProfile } from "@/repositories/profile/get-user-profile";
import { Prisma } from "@/generated/prisma/client";
import {createClient} from "@/lib/supabase/server";

export type UserProfileResponse = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    fullName: string;
};


export async function getUserProfileService(): Promise<UserProfileResponse | null> {
    let profile;

    const supabase = await createClient()
    const { data: user  } = await supabase.auth.getUser()

    try {
        profile = await getUserProfile(user?.user?.id ?? "");
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
            return null;
        }

        throw error;
    }

    if (!profile) {
        return null;
    }

    return {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        fullName: `${profile.firstName} ${profile.lastName}`.trim(),
    };
}
