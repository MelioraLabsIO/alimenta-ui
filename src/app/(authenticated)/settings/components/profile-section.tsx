"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { User } from "lucide-react";
import {
    Avatar,
    AvatarFallback,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Text,
    Separator,
} from "@/components/mantine/ui";
import { toast } from "@/lib/notifications";
import { updateProfile } from "@/apis/profile/mutations";
// import { type UserProfileResponse } from "@/apis/profile/queries";
import { useProfileStore } from "@/stores/profile.store";
import { UserProfile } from "@/core/types/models/profile";

export function ProfileSection() {
    const [name, setName] = useState({ firstName: "", lastName: "" });

    const data = useProfileStore((state) => state.profile);
    const setProfile = useProfileStore((state) => state.setProfile);
    const isLoading = !data;

    const { mutate: mutateUserProfile } = useMutation({
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

    const email = data?.email ?? "";
    const fullName = `${name.firstName} ${name.lastName}`.trim();
    const avatarInitials = data
        ? `${data.firstName[0] ?? ""}${data.lastName[0] ?? ""}`.toUpperCase()
        : "";
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
        <Card className="border-border/50 bg-card/60">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" /> Profile
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-xl bg-primary/20 text-primary font-bold">
                            {isLoading ? ".." : avatarInitials}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium">
                            {isLoading ? "Loading..." : fullName}
                        </p>
                        <p className="text-xs text-muted-foreground">{email}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 h-7 text-xs"
                        >
                            Change avatar
                        </Button>
                    </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Text>First name</Text>
                        <Input
                            id="firstName"
                            type="text"
                            value={name.firstName}
                            onChange={(event) =>
                                setName((prev) => ({
                                    ...prev,
                                    firstName: event.target.value,
                                }))
                            }
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Text>Last name</Text>
                        <Input
                            id="lastName"
                            type="text"
                            value={name.lastName}
                            onChange={(event) =>
                                setName((prev) => ({
                                    ...prev,
                                    lastName: event.target.value,
                                }))
                            }
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Text>Email</Text>
                    <Input
                        id="email"
                        value={email}
                        readOnly
                        className="opacity-60 cursor-not-allowed"
                    />
                </div>

                <Button
                    size="sm"
                    disabled={!hasModifiedProfile}
                    onClick={handleSaveProfile}
                >
                    Save profile
                </Button>
            </CardContent>
        </Card>
    );
}
