"use client";

import Link from "next/link";
import { User } from "lucide-react";
import {
    Avatar,
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/mantine/ui";
import { logout } from "@/app/(public)/login/actions";
import { useProfileStore } from "@/stores/profile.store";
import { getProfileInitials } from "@/lib/profile";

/**
 * Avatar button opening the account menu: who you're signed in as, links into
 * settings, and sign out. Sign out calls the `logout` server action, which
 * clears the Supabase session and redirects.
 *
 * The profile is fetched once by `AuthUserProvider` and only read from the
 * store here, so the first render happens before it arrives — every field
 * below has to tolerate a null profile.
 */
export function HeaderUserMenu() {
    const profile = useProfileStore((state) => state.profile);
    const profileError = useProfileStore((state) => state.error);

    const initials = getProfileInitials(profile);
    // The fetch can also fail outright, in which case waiting forever on
    // "Loading…" would be a lie.
    const displayName =
        profile?.displayName ??
        (profileError ? "Profile unavailable" : "Loading…");

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full app-avatar-button"
                    aria-label={
                        profile
                            ? `Account menu for ${profile.displayName}`
                            : "Account menu"
                    }
                >
                    <Avatar className="h-7 w-7 text-xs">
                        {initials || (
                            <User className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-sm">
                            {displayName}
                        </span>
                        {profile?.email && (
                            <span className="text-xs text-muted-foreground">
                                {profile.email}
                            </span>
                        )}
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/settings">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-destructive cursor-pointer"
                    onSelect={() => logout()}
                >
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
