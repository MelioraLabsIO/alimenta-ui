"use client";

import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Divider, Stack, Text, TextInput } from "@mantine/core";
import { LogIn } from "lucide-react";
import {
    JoinSpinSessionResponse,
    SpinSession,
} from "@/app/(authenticated)/spin/shared/types";
import { joinSpinSessionAsGuest } from "@/apis/spin/mutations";
import { useSessionStorage } from "@/hooks/useSessionStorage";
import { toast } from "@/lib/notifications";
import { routes } from "@/lib/routes";
import {
    type JoinSpinSessionInput,
    joinSpinSessionSchema,
    type JoinSpinSessionSchema,
} from "@/contracts/spin/join-spin-session.schema";

/**
 * Guest half of the join screen: pick a display name, or bail out to sign in.
 * Rendered inside `JoinSpinSessionForm`'s card, so it carries no heading of
 * its own.
 */
export function AnonymousJoinForm({
    session,
    onJoinedParticipantAction,
}: {
    session: SpinSession;
    onJoinedParticipantAction: (result: JoinSpinSessionResponse) => void;
}) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<JoinSpinSessionInput, unknown, JoinSpinSessionSchema>({
        resolver: zodResolver(joinSpinSessionSchema),
        defaultValues: { displayName: "" },
    });

    const [, setParticipantToken] = useSessionStorage(
        `spin:${session.id}:participant-token`
    );

    const { mutate: join, isPending } = useMutation({
        mutationFn: async (data: JoinSpinSessionSchema) =>
            joinSpinSessionAsGuest(session.id, data.displayName),
        onSuccess: (result) => {
            if (result.participantToken) {
                setParticipantToken(result.participantToken);
            }

            onJoinedParticipantAction(result);
        },
        onError: () => {
            toast.error("Failed to join, please try again.");
        },
        retry: 1,
    });

    const handleJoinAsGuest = useCallback(
        ({ displayName }: { displayName: string }) => {
            join({ displayName } as JoinSpinSessionSchema);
        },
        [join]
    );

    return (
        <Stack gap="lg">
            <Box
                component="form"
                onSubmit={handleSubmit(handleJoinAsGuest)}
                noValidate
            >
                <Stack gap="md">
                    <TextInput
                        id="displayName"
                        label="Your name"
                        placeholder="How should we call you?"
                        error={errors.displayName?.message}
                        {...register("displayName")}
                    />

                    <Button
                        type="submit"
                        size="lg"
                        radius="lg"
                        fullWidth
                        fw={700}
                        loading={isPending}
                        leftSection={<LogIn size={16} />}
                    >
                        {isPending ? "Joining…" : "Join session"}
                    </Button>
                </Stack>
            </Box>

            <Divider
                label="or"
                labelPosition="center"
                styles={{
                    label: {
                        fontSize: "var(--mantine-font-size-xxs)",
                        textTransform: "uppercase",
                        letterSpacing: "var(--ls-wide)",
                        color: "var(--tx3)",
                    },
                }}
            />

            <Stack gap="xs" ta="center">
                <Button
                    component="a"
                    href={routes.login({
                        next: routes.spinSession(session.id, {
                            autojoin: true,
                        }),
                    })}
                    variant="default"
                    size="lg"
                    radius="lg"
                    fullWidth
                >
                    Sign in to Alimenta
                </Button>
                <Text fz="xs" c="var(--tx3)">
                    Signing in joins you under your account name.
                </Text>
            </Stack>
        </Stack>
    );
}
