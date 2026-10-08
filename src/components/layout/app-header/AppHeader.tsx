"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Burger, Button, Group, Text, Title } from "@mantine/core";
import { Plus } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useProfileStore } from "@/stores/profile.store";
import { getPageHeading } from "@/lib/page-headings";
import { HeaderSearch } from "./HeaderSearch";
import { HeaderNotifications } from "./HeaderNotifications";
import { HeaderUserMenu } from "./HeaderUserMenu";

type AppHeaderProps = {
    navOpened: boolean;
    onToggleNav: () => void;
};

/**
 * Page header at the top of the main column: the route's kicker and title on
 * the left, controls on the right. Pages don't render their own `<h1>`.
 * Below `md` the sidebar is collapsed, so the burger and account menu appear
 * here instead.
 */
export function AppHeader({ navOpened, onToggleNav }: AppHeaderProps) {
    const pathname = usePathname();
    const profile = useProfileStore((state) => state.profile);
    const { kicker, title } = getPageHeading(pathname, {
        firstName: profile?.firstName,
    });
    const onLogPage = pathname.startsWith("/log");

    return (
        <Group component="header" gap="md" wrap="wrap" px="xxs" pb="xxs">
            <Burger
                opened={navOpened}
                onClick={onToggleNav}
                hiddenFrom="md"
                size="sm"
                aria-label="Toggle navigation"
            />

            <Box miw={0}>
                <Text fz="sm" c="var(--tx2)">
                    {kicker}
                </Text>
                <Title order={1} mt="xxs">
                    {title}
                </Title>
            </Box>

            <Group gap="sm" ml="auto" wrap="nowrap">
                <HeaderSearch />
                <ThemeToggle />
                <HeaderNotifications />
                <HeaderUserMenu />
                {!onLogPage && (
                    <Button
                        component={Link}
                        href="/log"
                        leftSection={<Plus size={16} />}
                        visibleFrom="sm"
                    >
                        Log meal
                    </Button>
                )}
            </Group>
        </Group>
    );
}
