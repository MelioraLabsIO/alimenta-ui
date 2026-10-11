"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import {
    ActionIcon,
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
    LogOut,
} from "lucide-react";
import { Brand } from "@/components/layout/Brand";
import { SignOutConfirmModal } from "@/components/layout/SignOutConfirmModal";
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
 * "spin the wheel" nudge and the signed-in user with a sign-out button.
 * `onNavigate` lets the mobile shell close the panel once a link is followed.
 */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname();
    const profile = useProfileStore((state) => state.profile);
    const initials = getProfileInitials(profile);
    const [signOutOpen, signOut] = useDisclosure(false);

    return (
        <Stack h="100%" gap="xxs">
            <Box px="sm" pb="md" pt="xxs">
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
                                    px="sm"
                                    fz="xxs"
                                    c="var(--tx3)"
                                >
                                    Soon
                                </Badge>
                            ) : undefined
                        }
                    />
                );
            })}

            <Stack mt="auto" gap="sm">
                <Paper
                    radius="lg"
                    p="md"
                    bg="var(--acs)"
                    shadow="none"
                    style={{ borderColor: "transparent" }}
                >
                    <Stack gap="sm">
                        <Group gap="sm" wrap="nowrap">
                            <Dices size={15} color="var(--ac)" />
                            <Text fw={600} fz="sm">
                                Can&apos;t decide dinner?
                            </Text>
                        </Group>
                        <Text fz="xs" c="var(--tx2)" lh="md">
                            Spin your saved options and let the wheel pick.
                        </Text>
                        <Button
                            component={Link}
                            href="/spin"
                            size="xs"
                            radius="sm"
                            fullWidth
                            onClick={onNavigate}
                        >
                            Spin the wheel
                        </Button>
                    </Stack>
                </Paper>

                <Group gap="xxs" wrap="nowrap">
                    <UnstyledButton
                        component={Link}
                        href="/settings"
                        onClick={onNavigate}
                        px="sm"
                        py="xs"
                        miw={0}
                        style={{
                            flex: 1,
                            borderRadius: "var(--mantine-radius-sm)",
                        }}
                    >
                        <Group gap="sm" wrap="nowrap">
                            <Avatar size={30} fz="xxs">
                                {initials || "·"}
                            </Avatar>
                            <Box miw={0} style={{ flex: 1 }}>
                                <Text fw={600} fz="sm" truncate c="var(--tx)">
                                    {profile?.displayName ?? "Your account"}
                                </Text>
                                <Text fz="xxs" truncate c="var(--tx3)">
                                    {profile?.email ?? "Open settings"}
                                </Text>
                            </Box>
                        </Group>
                    </UnstyledButton>
                    <ActionIcon
                        variant="subtle"
                        size={34}
                        radius="sm"
                        aria-label="Sign out"
                        title="Sign out"
                        onClick={signOut.open}
                        style={{
                            flexShrink: 0,
                            "--ai-color": "var(--tx3)",
                            "--ai-hover":
                                "color-mix(in srgb, var(--ro) 14%, transparent)",
                            "--ai-hover-color": "var(--ro)",
                        }}
                    >
                        <LogOut size={16} />
                    </ActionIcon>
                </Group>
            </Stack>

            <SignOutConfirmModal opened={signOutOpen} onClose={signOut.close} />
        </Stack>
    );
}
