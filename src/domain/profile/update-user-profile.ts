import {createClient} from "@/lib/supabase/server";
import {updateUserProfile} from "@/repositories/profile/update-user-profile";

export type UserProfileResponse = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    fullName: string;
};


export async function updateUserProfileDomain(data: Pick<UserProfileResponse, "firstName" | "lastName">): Promise<UserProfileResponse | null> {
    let profile;

    const supabase = await createClient()
    const { data: user  } = await supabase.auth.getUser()

    try {
        profile = await updateUserProfile(user?.user?.id ?? "", data);
    } catch (error) {

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
