"use client";

import { Text } from "@mantine/core";
import { LogOut } from "lucide-react";
import { logout } from "@/app/(public)/login/actions";
import { useProfileStore } from "@/stores/profile.store";
import { SettingsGroup, SettingsRow } from "./SettingsGroup";

/** "Account" tab: the signed-in email and sign out. */
export function AccountSection() {
    const profile = useProfileStore((state) => state.profile);

    return (
        <SettingsGroup label="Account">
            <SettingsRow>
                <Text fw={500} style={{ flex: 1 }}>
                    Email
                </Text>
                <Text fz="sm" c="var(--tx2)">
                    {profile?.email ?? "—"}
                </Text>
            </SettingsRow>
            <SettingsRow last color="var(--ro)" onClick={() => logout()}>
                <Text fw={500} style={{ flex: 1 }}>
                    Sign out
                </Text>
                <LogOut size={15} />
            </SettingsRow>
        </SettingsGroup>
    );
}
