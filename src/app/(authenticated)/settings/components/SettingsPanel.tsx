"use client";

import { useState } from "react";
import { Box, Flex, Paper, Stack } from "@mantine/core";
import { AccountSection } from "./AccountSection";
import { AiPreferencesSection } from "./AiPreferencesSection";
import { FoodProfileSummary } from "./FoodProfileSummary";
import { GoalSection } from "./GoalSection";
import { PreferencesSection } from "./PreferencesSection";
import { ProfileSection } from "./ProfileSection";
import { SettingsNav } from "./SettingsNav";
import { type Goal, type SettingsTab, type Units } from "./settings-types";
import { useProfileStore } from "@/stores/profile.store";

const NEXT_GOAL: Record<Goal, Goal> = {
    cut: "maintain",
    maintain: "bulk",
    bulk: "cut",
};

/**
 * The settings panel: a section nav on the left, the "food profile" summary
 * and the active section on the right. Goal and units live here because the
 * summary sentence and the Goal tab both edit them; they are local state only
 * (no API behind them yet). Dislikes and allergies come from the saved
 * profile, which the Food preferences tab edits.
 */
export function SettingsPanel() {
    const [tab, setTab] = useState<SettingsTab>("goal");
    const [goal, setGoal] = useState<Goal>("maintain");
    const [units, setUnits] = useState<Units>("metric");
    const profile = useProfileStore((state) => state.profile);

    return (
        <Paper
            radius="xxl"
            p={0}
            mih={640}
            pos="relative"
            style={{ overflow: "hidden" }}
        >
            <Box
                pos="absolute"
                inset={0}
                style={{
                    background:
                        "radial-gradient(800px 460px at 75% -15%, var(--acs), transparent 60%), radial-gradient(600px 420px at 0% 110%, color-mix(in srgb, var(--bl) 10%, transparent), transparent 60%)",
                    pointerEvents: "none",
                }}
            />

            <Flex wrap="wrap" pos="relative">
                <SettingsNav active={tab} onChange={setTab} />

                <Stack
                    gap="xl"
                    pt="xxl"
                    pb={36}
                    px="clamp(18px, 3vw, 36px)"
                    style={{ flex: "1 1 300px", minWidth: 0 }}
                >
                    <FoodProfileSummary
                        goal={goal}
                        units={units}
                        dislikes={profile?.dislikes ?? []}
                        allergies={profile?.allergies ?? []}
                        onCycleGoal={() => setGoal(NEXT_GOAL[goal])}
                        onCycleUnits={() =>
                            setUnits(units === "metric" ? "imperial" : "metric")
                        }
                        onGoToFood={() => setTab("food")}
                    />

                    {tab === "profile" && <ProfileSection />}
                    {tab === "goal" && (
                        <GoalSection
                            goal={goal}
                            units={units}
                            onGoalChange={setGoal}
                            onUnitsChange={setUnits}
                        />
                    )}
                    {tab === "food" && <PreferencesSection />}
                    {tab === "ai" && <AiPreferencesSection />}
                    {tab === "account" && <AccountSection />}
                </Stack>
            </Flex>
        </Paper>
    );
}
