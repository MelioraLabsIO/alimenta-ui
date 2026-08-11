import { create } from "zustand";
import { getUserProfile } from "@/apis/profile/queries";

type UserProfile = Awaited<ReturnType<typeof getUserProfile>>;

type ProfileState = {
    profile: UserProfile | null;
    isLoading: boolean;
    error: string | null;
    initialized: boolean;
    fetchProfile: () => Promise<UserProfile | null>;
    setProfile: (profile: UserProfile | null) => void;
    reset: () => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
    profile: null,
    isLoading: false,
    error: null,
    initialized: false,
    async fetchProfile() {
        set({ isLoading: true, error: null });

        try {
            const profile = await getUserProfile();

            set({
                profile,
                isLoading: false,
                error: null,
                initialized: true,
            });

            return profile;
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to load profile";

            set({
                profile: null,
                isLoading: false,
                error: message,
                initialized: true,
            });

            return null;
        }
    },
    setProfile(profile) {
        set({ profile, initialized: true, error: null });
    },
    reset() {
        set({
            profile: null,
            isLoading: false,
            error: null,
            initialized: false,
        });
    },
}));
