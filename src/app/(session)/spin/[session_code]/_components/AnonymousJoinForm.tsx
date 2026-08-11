"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/mantine/ui";
import {
    SpinSession,
    SpinSessionParticipant,
} from "@/app/(authenticated)/spin/shared/types";
import { joinSpinSessionAsGuest } from "@/apis/spin/mutations";
import { toast } from "@/lib/notifications";
import {
    type JoinSpinSessionInput,
    joinSpinSessionSchema,
    type JoinSpinSessionSchema,
} from "@/contracts/spin/join-spin-session.schema";
import { Button } from "@mantine/core";

export function AnonymousJoinForm({
    session,
    onJoinedParticipantAction,
}: {
    session: SpinSession;
    onJoinedParticipantAction: (participant: SpinSessionParticipant) => void;
}) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<JoinSpinSessionInput, unknown, JoinSpinSessionSchema>({
        resolver: zodResolver(joinSpinSessionSchema),
        defaultValues: { displayName: "" },
    });

    const { mutate: join, isPending } = useMutation({
        mutationFn: async (data: JoinSpinSessionSchema) =>
            joinSpinSessionAsGuest(session.joinCode, data.displayName),
        onSuccess: (result) => {
            if (result.participantToken) {
                sessionStorage.setItem(
                    `spin:${session.joinCode}:participant-token`,
                    result.participantToken
                );
            }

            onJoinedParticipantAction(result.participant);
        },
        onError: () => {
            toast.error("Failed to join, please try again.");
        },
    });

    const handleJoinAsGuest = ({ displayName }: { displayName: string }) => {
        console.log(
            `Joining spin session as guest: ${session.joinCode}, name: ${displayName}`
        );
        join({ displayName } as JoinSpinSessionSchema);
    };

    return (
        <div>
            <h1>Join the wheel</h1>

            <form
                onSubmit={handleSubmit((data) => handleJoinAsGuest(data))}
                noValidate
            >
                <Input
                    placeholder="Your name"
                    className={errors.displayName ? "border-destructive" : ""}
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

            {/*<a href={`/login?next=/spin/${session.joinCode}`}>*/}
            {/*    Already have an Alimenta account? Sign in*/}
            {/*</a>*/}
        </div>
    );
}
