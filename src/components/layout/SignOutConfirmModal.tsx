"use client";

import { useState } from "react";
import {
    Button,
    Group,
    Modal,
    Stack,
    Text,
    ThemeIcon,
    Title,
} from "@mantine/core";
import { LoaderCircle, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/notifications";
import { routes } from "@/lib/routes";

/**
 * "Sign out of Alimenta?" confirmation shared by the sidebar, the mobile
 * account menu and Settings → Account.
 *
 * Signing out goes through the Supabase browser SDK, which revokes the session
 * and clears the auth cookies, so the middleware sends any later visit to a
 * restricted page back to login. The redirect is a full page load on purpose:
 * it drops the in-memory profile/auth stores and the React Query cache, so
 * nothing from this account survives into the next sign-in.
 */
export function SignOutConfirmModal({
    opened,
    onClose,
}: {
    opened: boolean;
    onClose: () => void;
}) {
    const [signingOut, setSigningOut] = useState(false);

    async function signOut() {
        setSigningOut(true);

        const { error } = await createClient().auth.signOut();

        if (error) {
            setSigningOut(false);
            toast.error("Couldn't sign you out", {
                description: error.message,
            });
            return;
        }

        window.location.replace(routes.login());
    }

    return (
        <Modal
            opened={opened}
            onClose={() => !signingOut && onClose()}
            size={380}
            radius="xl"
            padding={0}
            withCloseButton={false}
        >
            <Stack align="center" ta="center" gap="sm" pt="xxl" px="xl" pb="lg">
                <ThemeIcon color="rose" size={52} radius="lg">
                    <LogOut size={22} />
                </ThemeIcon>
                <Title order={3} lts="var(--ls-snug)" mt="xxs">
                    Sign out of Alimenta?
                </Title>
                <Text
                    fz="sm"
                    c="var(--tx2)"
                    lh="md"
                    style={{ textWrap: "pretty" }}
                >
                    Your meals and plans stay saved. You&apos;ll need to sign in
                    again on this device.
                </Text>
                <Group w="100%" gap="sm" mt="sm" grow wrap="nowrap">
                    <Button
                        variant="default"
                        h={44}
                        radius="md"
                        disabled={signingOut}
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="rose"
                        h={44}
                        radius="md"
                        fw={700}
                        onClick={signOut}
                        leftSection={
                            signingOut ? (
                                <LoaderCircle
                                    size={15}
                                    style={{
                                        animation:
                                            "alm-spin 0.8s linear infinite",
                                    }}
                                />
                            ) : (
                                <LogOut size={15} />
                            )
                        }
                        style={{
                            pointerEvents: signingOut ? "none" : undefined,
                        }}
                    >
                        {signingOut ? "Signing out…" : "Sign out"}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
