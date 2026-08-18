"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container, Tabs } from "@mantine/core";
import { Dices } from "lucide-react";

type SpinTab = "personal" | "shared";

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
        <Container
            size="lg"
            className="py-8 px-4"
            style={{
                alignContent: "center",
                justifyContent: "center",
                display: "flex",
                flexDirection: "column",
                width: "100%",
            }}
        >
            <header className="mb-8">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    <Dices className="h-3.5 w-3.5" />
                    Meal Picker
                </div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Spin Wheel
                </h1>
            </header>

            <Tabs value={activeTab} variant="pills" color="teal">
                <Tabs.List
                    justify="center"
                    className="mb-4"
                    aria-label="Spin wheel modes"
                >
                    <Tabs.Tab
                        value="personal"
                        component={Link}
                        {...{ href: "/spin/personal" }}
                    >
                        Personal
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="shared"
                        component={Link}
                        {...{ href: "/spin/shared" }}
                    >
                        Shared
                    </Tabs.Tab>
                </Tabs.List>
            </Tabs>

            {children}
        </Container>
    );
}
