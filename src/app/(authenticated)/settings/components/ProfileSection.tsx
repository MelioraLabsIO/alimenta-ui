"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Avatar, Box, Button, Stack, Text, TextInput } from "@mantine/core";
import { Save } from "lucide-react";
import { toast } from "@/lib/notifications";
import { updateProfile } from "@/apis/profile/mutations";
import { useProfileStore } from "@/stores/profile.store";
import { getProfileInitials } from "@/lib/profile";
import { UserProfile } from "@/core/types/models/profile";
import { SettingsGroup, SettingsRow } from "./SettingsGroup";

function NameRow({
    label,
    value,
    onChange,
    last,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    last?: boolean;
}) {
    return (
        <SettingsRow last={last}>
            <Text component="label" w={110} fw={500}>
                {label}
            </Text>
            <TextInput
                variant="unstyled"
                aria-label={label}
                value={value}
                onChange={(event) => onChange(event.currentTarget.value)}
                style={{ flex: 1, minWidth: 0 }}
                styles={{
                    input: {
                        height: 40,
                        textAlign: "right",
                        paddingInline: 0,
                        fontSize: 14,
                    },
                }}
            />
        </SettingsRow>
    );
}

export function ProfileSection() {
    const [name, setName] = useState({ firstName: "", lastName: "" });

    const data = useProfileStore((state) => state.profile);
    const setProfile = useProfileStore((state) => state.setProfile);
    const isLoading = !data;

    const { mutate: mutateUserProfile, isPending } = useMutation({
        mutationKey: ["update-user-profile"],
        mutationFn: async (profile: Partial<UserProfile>) =>
            updateProfile(profile),
        onSuccess: (updatedProfile) => {
            if (updatedProfile) {
                setProfile(updatedProfile);
            }

            toast.success("Profile updated successfully");
        },
        onError: () => {
            toast.error("Failed to update profile, please try again.");
        },
    });

    useEffect(() => {
        if (data) {
            setName({
                firstName: data.firstName ?? "",
                lastName: data.lastName ?? "",
            });
        }
    }, [data]);

    const avatarInitials = getProfileInitials(data);
    const hasModifiedProfile = Boolean(
        data &&
        (data.firstName !== name.firstName || data.lastName !== name.lastName)
    );

    function handleSaveProfile() {
        mutateUserProfile({
            firstName: name.firstName,
            lastName: name.lastName,
        });
    }

    return (
        <Stack gap={16}>
            <SettingsGroup label="Profile">
                <SettingsRow minHeight={72}>
                    <Avatar size={44}>
                        {isLoading ? ".." : avatarInitials}
                    </Avatar>
                    <Box style={{ flex: 1 }}>
                        <Text fw={500}>Photo</Text>
                        <Text fz={12} c="var(--tx3)">
                            Shown to friends in shared spins
                        </Text>
                    </Box>
                    <Button
                        type="button"
                        variant="default"
                        size="xs"
                        h={32}
                        px={14}
                        bg="var(--sf)"
                    >
                        Change
                    </Button>
                </SettingsRow>
                <NameRow
                    label="First name"
                    value={name.firstName}
                    onChange={(firstName) =>
                        setName((prev) => ({ ...prev, firstName }))
                    }
                />
                <NameRow
                    label="Last name"
                    value={name.lastName}
                    onChange={(lastName) =>
                        setName((prev) => ({ ...prev, lastName }))
                    }
                    last
                />
            </SettingsGroup>

            <Button
                type="button"
                h={40}
                px={18}
                style={{ alignSelf: "flex-start" }}
                disabled={!hasModifiedProfile}
                loading={isPending}
                leftSection={<Save size={15} />}
                onClick={handleSaveProfile}
            >
                Save profile
            </Button>
        </Stack>
    );
}
