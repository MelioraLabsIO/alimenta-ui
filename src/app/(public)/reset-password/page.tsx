"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Button,
    Center,
    Paper,
    PasswordInput,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { Brand } from "@/components/layout/Brand";
import { toast } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData(event.currentTarget);
            const password =
                (formData.get("password") as string | null)?.trim() ?? "";
            const confirmPassword =
                (formData.get("confirmPassword") as string | null)?.trim() ??
                "";

            if (!password || !confirmPassword) {
                toast.error("Please fill in both password fields.");
                return;
            }

            if (password.length < 6) {
                toast.error("Password must be at least 6 characters.");
                return;
            }

            if (password !== confirmPassword) {
                toast.error("Passwords do not match.");
                return;
            }

            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({ password });

            if (error) {
                toast.error(error.message);
                return;
            }

            toast.success("Password updated. You can now sign in.");
            router.push("/login");
        } catch (error) {
            toast.error("An unexpected error occurred. Please try again.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Box
            mih="100dvh"
            c="var(--tx)"
            style={{
                background: "var(--wash)",
                backgroundAttachment: "fixed",
            }}
        >
            <Center mih="100dvh" p="xl">
                <Stack align="center" gap="xl" w="100%" maw={460}>
                    <Brand />

                    <Paper
                        radius="xxl"
                        p="xxl"
                        pt={36}
                        w="100%"
                        withBorder
                        style={{
                            animation: "alm-in 500ms var(--motion-spring) both",
                        }}
                    >
                        <Box component="form" onSubmit={handleSubmit}>
                            <Stack gap="xl">
                                <Stack gap="sm">
                                    <Title order={2}>Set a new password</Title>
                                    <Text fz="md" c="var(--tx2)" lh="lg">
                                        Enter your new password below. It needs
                                        at least 6 characters.
                                    </Text>
                                </Stack>

                                <Stack gap="md">
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        label="New password"
                                        autoComplete="new-password"
                                        required
                                        disabled={loading}
                                    />
                                    <PasswordInput
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        label="Confirm password"
                                        autoComplete="new-password"
                                        required
                                        disabled={loading}
                                    />
                                </Stack>

                                <Button
                                    type="submit"
                                    size="lg"
                                    fullWidth
                                    loading={loading}
                                >
                                    Update password
                                </Button>
                            </Stack>
                        </Box>
                    </Paper>
                </Stack>
            </Center>
        </Box>
    );
}
