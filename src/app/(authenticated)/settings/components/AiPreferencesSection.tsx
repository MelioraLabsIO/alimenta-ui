"use client";

import { useState } from "react";
import {
    Box,
    Button,
    Group,
    Stack,
    Switch,
    Text,
    ThemeIcon,
} from "@mantine/core";
import { Check, ListChecks, Sparkles } from "lucide-react";
import { SettingsGroup, SettingsRow } from "./SettingsGroup";

type PreferenceKey = "autoExtract" | "askBeforeSave";

const AI_PREFERENCE_ITEMS: {
    key: PreferenceKey;
    label: string;
    description: string;
    icon: typeof Sparkles;
}[] = [
    {
        key: "autoExtract",
        label: "Auto-extract nutrition",
        description: "Estimate nutrition when you describe a meal in words.",
        icon: Sparkles,
    },
    {
        key: "askBeforeSave",
        label: "Ask before saving",
        description: "Show the extracted meal for review before it is saved.",
        icon: ListChecks,
    },
];

/** "AI & suggestions" tab: quick pill toggles, then the same switches as rows. */
export function AiPreferencesSection() {
    const [preferences, setPreferences] = useState<
        Record<PreferenceKey, boolean>
    >({
        autoExtract: true,
        askBeforeSave: false,
    });

    function toggle(key: PreferenceKey, checked?: boolean) {
        setPreferences((prev) => ({
            ...prev,
            [key]: checked ?? !prev[key],
        }));
    }

    return (
        <Stack gap={10}>
            <Text
                fz={11}
                fw={600}
                c="var(--tx3)"
                pl={16}
                tt="uppercase"
                lts="0.07em"
            >
                AI helps with
            </Text>
            <Group gap={8} pl={4}>
                {AI_PREFERENCE_ITEMS.map((item) => {
                    const on = preferences[item.key];
                    const Icon = on ? Check : item.icon;

                    return (
                        <Button
                            key={item.key}
                            type="button"
                            size="sm"
                            h={40}
                            variant={on ? "light" : "default"}
                            c={on ? "var(--ac)" : "var(--tx3)"}
                            leftSection={<Icon size={15} />}
                            onClick={() => toggle(item.key)}
                            aria-pressed={on}
                            style={{
                                borderColor: on
                                    ? "color-mix(in srgb, var(--ac) 45%, transparent)"
                                    : undefined,
                                borderWidth: 1,
                                borderStyle: "solid",
                                transition: "all 160ms",
                            }}
                        >
                            {item.label}
                        </Button>
                    );
                })}
            </Group>

            <SettingsGroup label="">
                {AI_PREFERENCE_ITEMS.map((item, index) => {
                    const checked = preferences[item.key];
                    const Icon = item.icon;

                    return (
                        <SettingsRow
                            key={item.key}
                            last={index === AI_PREFERENCE_ITEMS.length - 1}
                            onClick={() => toggle(item.key)}
                        >
                            <ThemeIcon size={32} radius={10}>
                                <Icon size={15} />
                            </ThemeIcon>
                            <Box py={12} style={{ flex: 1, minWidth: 0 }}>
                                <Text fw={500}>{item.label}</Text>
                                <Text fz={12} c="var(--tx3)" mt={2}>
                                    {item.description}
                                </Text>
                            </Box>
                            <Box
                                style={{ flexShrink: 0 }}
                                onClick={(event) => event.stopPropagation()}
                            >
                                <Switch
                                    aria-label={item.label}
                                    checked={checked}
                                    onChange={(event) =>
                                        toggle(
                                            item.key,
                                            event.currentTarget.checked
                                        )
                                    }
                                />
                            </Box>
                        </SettingsRow>
                    );
                })}
            </SettingsGroup>
        </Stack>
    );
}
