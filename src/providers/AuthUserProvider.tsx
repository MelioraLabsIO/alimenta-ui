"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthUserStore } from "@/stores/auth-user.store";

export default function AuthUserProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const fetchAuthenticatedUser = useAuthUserStore(
        (state) => state.fetchAuthenticatedUser
    );
    const setUser = useAuthUserStore((state) => state.setUser);

    useEffect(() => {
        void fetchAuthenticatedUser();

        const supabase = createClient();
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchAuthenticatedUser, setUser]);

    return <>{children}</>;
}

