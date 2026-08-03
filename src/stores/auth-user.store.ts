import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type AuthUserState = {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    initialized: boolean;
    fetchAuthenticatedUser: () => Promise<User | null>;
    setUser: (user: User | null) => void;
    reset: () => void;
};

const supabase = createClient();

export const useAuthUserStore = create<AuthUserState>((set) => ({
    user: null,
    isLoading: false,
    error: null,
    initialized: false,
    async fetchAuthenticatedUser() {
        set({ isLoading: true, error: null });

        try {
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser();

            if (error) {
                set({
                    user: null,
                    isLoading: false,
                    error: error.message,
                    initialized: true,
                });

                return null;
            }

            set({
                user,
                isLoading: false,
                error: null,
                initialized: true,
            });

            return user;
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to load user";

            set({
                user: null,
                isLoading: false,
                error: message,
                initialized: true,
            });

            return null;
        }
    },
    setUser(user) {
        set({ user, initialized: true, error: null });
    },
    reset() {
        set({
            user: null,
            isLoading: false,
            error: null,
            initialized: false,
        });
    },
}));

