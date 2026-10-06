"use client";

import {
    Avatar,
    Box,
    Group,
    NavLink,
    Stack,
    Text,
    ThemeIcon,
} from "@mantine/core";
import { Salad, Shield, Sparkles, Target, User } from "lucide-react";
import { useProfileStore } from "@/stores/profile.store";
import { getProfileInitials } from "@/lib/profile";
import { type SettingsTab, tint } from "./settings-types";

const NAV: {
    id: SettingsTab;
    label: string;
    icon: typeof User;
    token: string;
}[] = [
    { id: "profile", label: "Profile", icon: User, token: "var(--bl)" },
    { id: "goal", label: "Goal & body", icon: Target, token: "var(--ac)" },
    { id: "food", label: "Food preferences", icon: Salad, token: "var(--am)" },
    { id: "ai", label: "AI & suggestions", icon: Sparkles, token: "var(--ro)" },
    { id: "account", label: "Account", icon: Shield, token: "var(--tx2)" },
];

/** Left column of the settings panel: who you are, then the section list. */
export function SettingsNav({
    active,
    onChange,
}: {
    active: SettingsTab;
    onChange: (tab: SettingsTab) => void;
}) {
    const profile = useProfileStore((state) => state.profile);
    const initials = getProfileInitials(profile);

    return (
        <Stack
            component="nav"
            gap={2}
            py={18}
            px={10}
            w={{ base: "100%", sm: 210 }}
            style={{
                flexShrink: 0,
                borderRight: "1px solid var(--bd)",
                background: "color-mix(in srgb, var(--sf2) 45%, transparent)",
            }}
        >
            <Group gap={10} wrap="nowrap" px={10} pt={6} pb={16}>
                <Avatar size={40} fz={14}>
                    {initials || "·"}
                </Avatar>
                <Box miw={0}>
                    <Text fw={600} fz={14} truncate>
                        {profile?.displayName ?? "Your account"}
                    </Text>
                    <Text fz={12} c="var(--tx3)" truncate>
                        {profile?.email ?? ""}
                    </Text>
                </Box>
            </Group>

            {NAV.map(({ id, label, icon: Icon, token }) => (
                <NavLink
                    key={id}
                    component="button"
                    type="button"
                    label={label}
                    active={active === id}
                    onClick={() => onChange(id)}
                    styles={{
                        root: { borderRadius: 12, paddingInline: 10 },
                        label: { fontSize: 13 },
                        section: { color: token },
                    }}
                    leftSection={
                        <ThemeIcon
                            size={26}
                            radius={8}
                            variant="transparent"
                            bg={tint(token)}
                            c={token}
                        >
                            <Icon size={14} />
                        </ThemeIcon>
                    }
                />
            ))}
        </Stack>
    );
}
