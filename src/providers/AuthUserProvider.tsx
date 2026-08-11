"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthUserStore } from "@/stores/auth-user.store";
import { useProfileStore } from "@/stores/profile.store";

export default function AuthUserProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const fetchAuthenticatedUser = useAuthUserStore(
        (state) => state.fetchAuthenticatedUser
    );
    const setUser = useAuthUserStore((state) => state.setUser);
    const fetchProfile = useProfileStore((state) => state.fetchProfile);
    const resetProfile = useProfileStore((state) => state.reset);

    useEffect(() => {
        void fetchAuthenticatedUser().then((user) => {
            if (user) {
                void fetchProfile();
            }
        });

        const supabase = createClient();
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);

            if (session?.user) {
                void fetchProfile();
            } else {
                resetProfile();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchAuthenticatedUser, setUser, fetchProfile, resetProfile]);

    return <>{children}</>;
}

