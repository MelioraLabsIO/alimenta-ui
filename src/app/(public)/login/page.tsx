"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
    Anchor,
    Box,
    Button,
    Center,
    Paper,
    PasswordInput,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { forgotPassword, login, signup } from "./actions";
import { Brand } from "@/components/layout/Brand";
import { toast } from "@/lib/notifications";
import { sanitizeNextPath } from "@/lib/routes";

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginPageContent />
        </Suspense>
    );
}

function LoginPageContent() {
    const searchParams = useSearchParams();
    const redirectTo = sanitizeNextPath(searchParams.get("next"));
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData(event.currentTarget);
            const result = isForgotPassword
                ? await forgotPassword(formData)
                : isSignUp
                  ? await signup(formData)
                  : await login(formData);

            if (result?.error) {
                toast.error(result.error);
            } else if (result?.success) {
                if (
                    "message" in result &&
                    typeof result.message === "string" &&
                    result.message
                ) {
                    toast.success(result.message);
                } else {
                    toast.success(
                        isSignUp ? "Account created!" : "Welcome back!"
                    );
                    // Explicit redirect on client side if successful
                    window.location.href = redirectTo;
                }
            }
        } catch (error) {
            toast.error("An unexpected error occurred. Please try again.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const title = isForgotPassword
        ? "Reset your password"
        : isSignUp
          ? "Create an account"
          : "Welcome back";
    const subtitle = isForgotPassword
        ? "Enter your email and we will send you a secure reset link."
        : isSignUp
          ? "Start tracking your food and wellness journey."
          : "Sign in to your account to continue.";
    const submitLabel = isForgotPassword
        ? "Send reset link"
        : isSignUp
          ? "Create account"
          : "Sign in";

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
                                    <Title order={2}>{title}</Title>
                                    <Text fz="md" c="var(--tx2)" lh="lg">
                                        {subtitle}
                                    </Text>
                                </Stack>

                                <Stack gap="md">
                                    {isSignUp && !isForgotPassword && (
                                        <SimpleGrid
                                            cols={{ base: 1, xs: 2 }}
                                            spacing="sm"
                                        >
                                            <TextInput
                                                id="firstName"
                                                name="firstName"
                                                type="text"
                                                label="First name"
                                                autoComplete="given-name"
                                                required={isSignUp}
                                                disabled={loading}
                                            />
                                            <TextInput
                                                id="lastName"
                                                name="lastName"
                                                type="text"
                                                label="Last name"
                                                autoComplete="family-name"
                                                required={isSignUp}
                                                disabled={loading}
                                            />
                                        </SimpleGrid>
                                    )}

                                    <TextInput
                                        id="email"
                                        name="email"
                                        type="email"
                                        label="Email"
                                        placeholder="m@example.com"
                                        autoComplete="email"
                                        required
                                        disabled={loading}
                                    />

                                    {!isForgotPassword && (
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            label="Password"
                                            autoComplete={
                                                isSignUp
                                                    ? "new-password"
                                                    : "current-password"
                                            }
                                            required
                                            disabled={loading}
                                        />
                                    )}
                                </Stack>

                                <Stack gap="sm">
                                    <Button
                                        type="submit"
                                        size="lg"
                                        fullWidth
                                        loading={loading}
                                    >
                                        {submitLabel}
                                    </Button>

                                    {!isSignUp && !isForgotPassword && (
                                        <Button
                                            type="button"
                                            variant="subtle"
                                            size="sm"
                                            fullWidth
                                            onClick={() =>
                                                setIsForgotPassword(true)
                                            }
                                            disabled={loading}
                                        >
                                            Forgot your password?
                                        </Button>
                                    )}

                                    {isForgotPassword && (
                                        <Button
                                            type="button"
                                            variant="default"
                                            size="lg"
                                            fullWidth
                                            onClick={() =>
                                                setIsForgotPassword(false)
                                            }
                                            disabled={loading}
                                        >
                                            Back to sign in
                                        </Button>
                                    )}
                                </Stack>

                                <Text fz="sm" c="var(--tx2)" ta="center">
                                    {isSignUp
                                        ? "Already have an account? "
                                        : "Don't have an account? "}
                                    <Anchor
                                        component="button"
                                        type="button"
                                        fz="sm"
                                        fw={600}
                                        c="var(--ac)"
                                        disabled={loading}
                                        onClick={() => {
                                            setIsForgotPassword(false);
                                            setIsSignUp(!isSignUp);
                                        }}
                                    >
                                        {isSignUp ? "Sign in" : "Sign up"}
                                    </Anchor>
                                </Text>
                            </Stack>
                        </Box>
                    </Paper>
                </Stack>
            </Center>
        </Box>
    );
}
