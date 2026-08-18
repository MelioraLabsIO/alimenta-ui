"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/mantine/ui";
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
import { Button, Stack } from "@mantine/core";
import { useCallback } from "react";

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
        `spin:${session.sessionCode}:participant-token`
    );

    const { mutate: join, isPending } = useMutation({
        mutationFn: async (data: JoinSpinSessionSchema) =>
            joinSpinSessionAsGuest(session.sessionCode, data.displayName),
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
        <Stack gap={4}>
            <h1>Join the wheel</h1>

            <Stack gap={2} style={{ marginBottom: "1rem" }}>
                <form
                    onSubmit={handleSubmit((data) => handleJoinAsGuest(data))}
                    noValidate
                    className={"flex flex-col gap-2"}
                >
                    <Input
                        placeholder="Your name"
                        className={
                            errors.displayName ? "border-destructive" : ""
                        }
                        {...register("displayName")}
                    />
                    {errors.displayName && (
                        <p className="text-xs text-destructive">
                            {errors.displayName.message}
                        </p>
                    )}

                    <Button variant="filled" type="submit" disabled={isPending}>
                        Join session
                    </Button>
                </form>
            </Stack>

            <a
                href={routes.login({
                    next: routes.spinShared(session.sessionCode, {
                        autojoin: true,
                    }),
                })}
                className="text-sm text-primary"
            >
                Already have an Alimenta account? Sign in
            </a>
        </Stack>
    );
}
