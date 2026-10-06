"use client";

import Link from "next/link";
import { ActionIcon, Avatar, Box, Menu, Stack, Text } from "@mantine/core";
import { User } from "lucide-react";
import { logout } from "@/app/(public)/login/actions";
import { useProfileStore } from "@/stores/profile.store";
import { getProfileInitials } from "@/lib/profile";

/**
 * Avatar button opening the account menu: who you're signed in as, links into
 * settings, and sign out. Sign out calls the `logout` server action, which
 * clears the Supabase session and redirects.
 *
 * On `md` and up the sidebar shows the user instead, so this only renders on
 * small screens.
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
        <Box hiddenFrom="md">
            <Menu position="bottom-end" width={200}>
                <Menu.Target>
                    <ActionIcon
                        aria-label={
                            profile
                                ? `Account menu for ${profile.displayName}`
                                : "Account menu"
                        }
                    >
                        <Avatar size={28} fz={11}>
                            {initials || <User size={14} aria-hidden="true" />}
                        </Avatar>
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Label>
                        <Stack gap={2}>
                            <Text fz="sm" fw={600} c="var(--tx)">
                                {displayName}
                            </Text>
                            {profile?.email && (
                                <Text fz="xs" c="var(--tx3)">
                                    {profile.email}
                                </Text>
                            )}
                        </Stack>
                    </Menu.Label>
                    <Menu.Divider />
                    <Menu.Item component={Link} href="/settings">
                        Profile
                    </Menu.Item>
                    <Menu.Item component={Link} href="/settings">
                        Settings
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item color="rose" onClick={() => logout()}>
                        Sign out
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </Box>
    );
}
