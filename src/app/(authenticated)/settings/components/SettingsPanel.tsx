"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { updateGeneralPreferences } from "@/apis/profile/mutations";
import type { GeneralPreferencesUpdate } from "@/core/types/models/profile";
import { toast } from "@/lib/notifications";
import {
    changedGeneralPreferences,
    type GeneralPreferencesValues,
    toGeneralPreferencesValues,
} from "@/lib/general-preferences";

const NEXT_GOAL: Record<Goal, Goal> = {
    cut: "maintain",
    maintain: "bulk",
    bulk: "cut",
};

/**
 * The settings panel: a section nav on the left, the "food profile" summary
 * and the active section on the right. Goal and units (PD-133) are edited
 * here because the summary sentence and the Goal tab both change them: they
 * start from the saved profile, and the Goal tab's Save sends only the ones
 * that changed with `PATCH /profile`. Dislikes and allergies come from the
 * saved profile, which the Food preferences tab edits.
 */
export function SettingsPanel() {
    const [tab, setTab] = useState<SettingsTab>("goal");
    const profile = useProfileStore((state) => state.profile);
    const setProfile = useProfileStore((state) => state.setProfile);

    const savedGoal = profile?.goal ?? null;
    const savedUnits = profile?.units ?? null;
    const saved = useMemo(
        () =>
            toGeneralPreferencesValues({ goal: savedGoal, units: savedUnits }),
        [savedGoal, savedUnits]
    );
    const [draft, setDraft] = useState<GeneralPreferencesValues>(saved);

    // Newly loaded or saved units and goal replace any edits in progress.
    // Saving another tab doesn't, since it leaves these two as they were.
    useEffect(() => setDraft(saved), [saved]);

    const changes = changedGeneralPreferences(saved, draft);
    const isDirty = Object.keys(changes).length > 0;

    const { mutate: save, isPending } = useMutation({
        mutationKey: ["update-general-preferences"],
        mutationFn: (update: GeneralPreferencesUpdate) =>
            updateGeneralPreferences(update),
        onSuccess: (updatedProfile) => {
            setProfile(updatedProfile);
            toast.success("Goal and units saved!");
        },
        onError: () => {
            toast.error("Couldn't save your goal and units, please try again.");
        },
    });

    const setGoal = (goal: Goal) => setDraft((d) => ({ ...d, goal }));
    const setUnits = (units: Units) => setDraft((d) => ({ ...d, units }));
    const { goal, units } = draft;

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
                        onCycleGoal={() => {
                            setGoal(NEXT_GOAL[goal]);
                            setTab("goal");
                        }}
                        onCycleUnits={() => {
                            setUnits(
                                units === "metric" ? "imperial" : "metric"
                            );
                            setTab("goal");
                        }}
                        onGoToFood={() => setTab("food")}
                    />

                    {tab === "profile" && <ProfileSection />}
                    {tab === "goal" && (
                        <GoalSection
                            loading={!profile}
                            goal={goal}
                            units={units}
                            onGoalChange={setGoal}
                            onUnitsChange={setUnits}
                            canSave={isDirty}
                            saving={isPending}
                            onSave={() => save(changes)}
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
