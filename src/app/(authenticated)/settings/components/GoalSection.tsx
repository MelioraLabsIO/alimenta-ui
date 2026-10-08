"use client";

import {
    Box,
    Center,
    SegmentedControl,
    Stack,
    Text,
    ThemeIcon,
} from "@mantine/core";
import { Check, Equal, TrendingDown, TrendingUp } from "lucide-react";
import { SettingsGroup, SettingsRow } from "./SettingsGroup";
import {
    GOALS,
    type Goal,
    type Units,
    UNIT_DESCRIPTIONS,
    tint,
} from "./settings-types";

const GOAL_ICONS = {
    cut: TrendingDown,
    maintain: Equal,
    bulk: TrendingUp,
} as const;

/** "Goal & body" tab: pick a goal, choose units. */
export function GoalSection({
    goal,
    units,
    onGoalChange,
    onUnitsChange,
}: {
    goal: Goal;
    units: Units;
    onGoalChange: (goal: Goal) => void;
    onUnitsChange: (units: Units) => void;
}) {
    return (
        <Stack gap="xl">
            <SettingsGroup label="Goal">
                {GOALS.map((option, index) => {
                    const active = goal === option.value;
                    const Icon = GOAL_ICONS[option.value];

                    return (
                        <SettingsRow
                            key={option.value}
                            last={index === GOALS.length - 1}
                            onClick={() => onGoalChange(option.value)}
                        >
                            <ThemeIcon
                                size={32}
                                radius="sm"
                                variant="transparent"
                                bg={tint(option.token)}
                                c={option.token}
                            >
                                <Icon size={15} />
                            </ThemeIcon>
                            <Box style={{ flex: 1 }}>
                                <Text component="span" fw={500}>
                                    {option.label}
                                </Text>
                                <Text
                                    component="span"
                                    c="var(--tx3)"
                                    fz="sm"
                                    ml="sm"
                                >
                                    {option.description}
                                </Text>
                            </Box>
                            <Center
                                w={22}
                                h={22}
                                c="var(--act)"
                                bg={active ? "var(--ac)" : "var(--bd2)"}
                                style={{
                                    borderRadius: "var(--mantine-radius-pill)",
                                    transition: `background var(--motion-fast)`,
                                }}
                                aria-hidden="true"
                            >
                                <Check
                                    size={13}
                                    style={{ opacity: active ? 1 : 0 }}
                                />
                            </Center>
                        </SettingsRow>
                    );
                })}
            </SettingsGroup>

            <SettingsGroup label="Measurements">
                <SettingsRow last>
                    <Box style={{ flex: 1 }}>
                        <Text fw={500}>Units</Text>
                        <Text fz="xs" c="var(--tx3)">
                            {UNIT_DESCRIPTIONS[units]}
                        </Text>
                    </Box>
                    <SegmentedControl
                        size="xs"
                        color="alimenta"
                        value={units}
                        onChange={(value) => onUnitsChange(value as Units)}
                        data={[
                            { value: "metric", label: "Metric" },
                            { value: "imperial", label: "Imperial" },
                        ]}
                        styles={{
                            root: { backgroundColor: "var(--sf)" },
                            indicator: { backgroundColor: "var(--ac)" },
                            label: {
                                height: 30,
                                lineHeight: "30px",
                                paddingInline: "var(--mantine-spacing-md)",
                                fontSize: "var(--mantine-font-size-xs)",
                            },
                        }}
                    />
                </SettingsRow>
            </SettingsGroup>
        </Stack>
    );
}
