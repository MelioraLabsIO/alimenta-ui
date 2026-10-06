"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Avatar,
    Badge,
    Box,
    Button,
    Group,
    NavLink,
    Paper,
    Stack,
    Text,
    UnstyledButton,
} from "@mantine/core";
import {
    LayoutDashboard,
    CirclePlus,
    History,
    ChartLine,
    CalendarDays,
    Settings,
    Dices,
} from "lucide-react";
import { Brand } from "@/components/layout/Brand";
import { useProfileStore } from "@/stores/profile.store";
import { getProfileInitials } from "@/lib/profile";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/log", label: "Log meal", icon: CirclePlus },
    { href: "/spin", label: "Spin wheel", icon: Dices },
    { href: "/history", label: "History", icon: History },
    { href: "/insights", label: "Insights", icon: ChartLine },
    { href: "/plans", label: "Planner", icon: CalendarDays, soon: true },
    { href: "/settings", label: "Settings", icon: Settings },
];

/**
 * Everything inside the floating sidebar panel: brand, the route list, the
 * "spin the wheel" nudge and the signed-in user. `onNavigate` lets the mobile
 * shell close the panel once a link is followed.
 */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname();
    const profile = useProfileStore((state) => state.profile);
    const initials = getProfileInitials(profile);

    return (
        <Stack h="100%" gap={4}>
            <Box px={8} pb={14} pt={2}>
                <Brand />
            </Box>

            {navItems.map(({ href, label, icon: Icon, soon }) => {
                const active =
                    href === "/" ? pathname === "/" : pathname.startsWith(href);

                return (
                    <NavLink
                        key={href}
                        component={Link}
                        href={soon ? "#" : href}
                        label={label}
                        active={active}
                        disabled={soon}
                        onClick={onNavigate}
                        leftSection={<Icon size={17} />}
                        rightSection={
                            soon ? (
                                <Badge
                                    variant="surface"
                                    size="xs"
                                    h={20}
                                    px={8}
                                    fz={10}
                                    c="var(--tx3)"
                                >
                                    Soon
                                </Badge>
                            ) : undefined
                        }
                    />
                );
            })}

            <Stack mt="auto" gap={10}>
                <Paper
                    radius={16}
                    p={14}
                    bg="var(--acs)"
                    shadow="none"
                    style={{ borderColor: "transparent" }}
                >
                    <Stack gap={8}>
                        <Group gap={8} wrap="nowrap">
                            <Dices size={15} color="var(--ac)" />
                            <Text fw={600} fz={13}>
                                Can&apos;t decide dinner?
                            </Text>
                        </Group>
                        <Text fz={12} c="var(--tx2)" lh={1.45}>
                            Spin your saved options and let the wheel pick.
                        </Text>
                        <Button
                            component={Link}
                            href="/spin"
                            size="xs"
                            radius={11}
                            fullWidth
                            onClick={onNavigate}
                        >
                            Spin the wheel
                        </Button>
                    </Stack>
                </Paper>

                <UnstyledButton
                    component={Link}
                    href="/settings"
                    onClick={onNavigate}
                    px={8}
                    py={6}
                    style={{ borderRadius: 12 }}
                >
                    <Group gap={10} wrap="nowrap">
                        <Avatar size={30} fz={11}>
                            {initials || "·"}
                        </Avatar>
                        <Box miw={0} style={{ flex: 1 }}>
                            <Text fw={600} fz={13} truncate c="var(--tx)">
                                {profile?.displayName ?? "Your account"}
                            </Text>
                            <Text fz={11} truncate c="var(--tx3)">
                                {profile?.email ?? "Open settings"}
                            </Text>
                        </Box>
                    </Group>
                </UnstyledButton>
            </Stack>
        </Stack>
    );
}
