"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { Button, Input } from "@/components/mantine/ui";
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
import { useCallback } from "react";

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
        <div className="space-y-4">
            <form
                onSubmit={handleSubmit(handleJoinAsGuest)}
                noValidate
                className="space-y-3"
            >
                <div className="space-y-1.5">
                    <label
                        htmlFor="displayName"
                        className="text-xs font-medium text-muted-foreground"
                    >
                        Your name
                    </label>
                    {/* Mantine's `error` marks the input itself; a class on
                        `Input` would only reach the wrapper element. */}
                    <Input
                        id="displayName"
                        placeholder="How should we call you?"
                        error={errors.displayName?.message}
                        {...register("displayName")}
                    />
                </div>

                <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    loading={isPending}
                    leftSection={<LogIn className="h-4 w-4" />}
                >
                    {isPending ? "Joining…" : "Join session"}
                </Button>
            </form>

            <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-border/60" />
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    or
                </span>
                <span className="h-px flex-1 bg-border/60" />
            </div>

            <div className="space-y-1.5 text-center">
                <Button
                    component="a"
                    href={routes.login({
                        next: routes.spinSession(session.id, {
                            autojoin: true,
                        }),
                    })}
                    variant="outline"
                    fullWidth
                >
                    Sign in to Alimenta
                </Button>
                <p className="text-xs text-muted-foreground">
                    Signing in joins you under your account name.
                </p>
            </div>
        </div>
    );
}
