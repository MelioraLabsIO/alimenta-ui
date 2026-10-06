"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Group, Stack, Tabs, Text } from "@mantine/core";
import { User, Users } from "lucide-react";

type SpinTab = "personal" | "shared";

const INTRO: Record<SpinTab, string> = {
    personal: "Build your wheel, then spin to decide what to eat.",
    shared: "Create a session, invite friends, add meals, and spin to decide.",
};

/**
 * Mode switch for the spin screens. The page title lives in the app shell
 * header; this only adds the "Just me / With friends" pills and the intro.
 */
export default function SpinLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const activeTab: SpinTab = pathname.startsWith("/spin/shared")
        ? "shared"
        : "personal";

    return (
        <Stack gap={12}>
            <Group gap={12} align="center" wrap="wrap">
                <Tabs value={activeTab}>
                    <Tabs.List aria-label="Spin wheel modes">
                        <Tabs.Tab
                            value="personal"
                            component={Link}
                            {...{ href: "/spin/personal" }}
                            leftSection={<User size={15} />}
                        >
                            Just me
                        </Tabs.Tab>
                        <Tabs.Tab
                            value="shared"
                            component={Link}
                            {...{ href: "/spin/shared" }}
                            leftSection={<Users size={15} />}
                        >
                            With friends
                        </Tabs.Tab>
                    </Tabs.List>
                </Tabs>
                <Text fz={13} c="var(--tx2)">
                    {INTRO[activeTab]}
                </Text>
            </Group>

            {children}
        </Stack>
    );
}
