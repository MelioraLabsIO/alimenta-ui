"use client";

import type { ReactNode } from "react";
import { AppShell, Box } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { AppHeader } from "@/components/layout/app-header";
import { SidebarNav } from "@/components/layout/sidebar-nav";

const NAV_WIDTH = 220;
const GUTTER = 12;

/**
 * The signed-in shell: a floating glass sidebar on the left and a main column
 * that opens with the page header, both on the page wash with a 12px gutter.
 * Below `md` the sidebar collapses and the header's burger slides it in.
 */
export function AppShellLayout({ children }: { children: ReactNode }) {
    const [navOpened, { toggle, close }] = useDisclosure(false);

    return (
        <AppShell
            navbar={{
                width: NAV_WIDTH + GUTTER * 2,
                breakpoint: "md",
                collapsed: { mobile: !navOpened },
            }}
            padding={0}
            withBorder={false}
            styles={{
                root: {
                    minHeight: "100dvh",
                    background: "var(--wash)",
                    backgroundAttachment: "fixed",
                    color: "var(--tx)",
                },
                navbar: {
                    background: "var(--glass)",
                    border: "1px solid var(--bd)",
                    backdropFilter: "blur(24px)",
                    padding: "16px 10px",
                    zIndex: 200,
                },
            }}
        >
            <AppShell.Navbar
                w={{ base: 280, md: NAV_WIDTH }}
                top={{ base: 0, md: GUTTER }}
                left={{ base: 0, md: GUTTER }}
                h={{ base: "100dvh", md: `calc(100dvh - ${GUTTER * 2}px)` }}
                bdrs={{ base: 0, md: 22 }}
            >
                <SidebarNav onNavigate={close} />
            </AppShell.Navbar>

            <AppShell.Main>
                <Box
                    pt={22}
                    pb={36}
                    pl={{ base: GUTTER + 4, md: 16 }}
                    pr={{ base: GUTTER + 4, md: 18 }}
                >
                    <AppHeader navOpened={navOpened} onToggleNav={toggle} />
                    <Box mt={14}>{children}</Box>
                </Box>
            </AppShell.Main>
        </AppShell>
    );
}
