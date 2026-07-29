"use client";

import { useState } from "react";

import { Container, Tabs } from "@mantine/core";
import { Personal } from "@/app/(app)/spin/personal/Personal";
import { Shared } from "@/app/(app)/spin/shared/Shared";
import { Dices } from "lucide-react";

type ActiveTab = "personal" | "shared" | (string & {});

export default function SpinWheelPage() {
    const [activeTab, setActiveTab] = useState<ActiveTab | null>("personal");

    /********************************************* HANDLERS ************************************************/
    const handleTabChange = (tab: ActiveTab | null) => {
        if (!tab) return;
        setActiveTab(tab);
    };

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
                <p className="mt-1 text-sm text-muted-foreground">
                    {activeTab === "shared"
                        ? "Create a session, invite friends, add meals, and spin to decide what to eat."
                        : "Build your wheel, then spin to decide what to eat."}
                </p>
            </header>

            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="pills"
                color="teal"
            >
                <Tabs.List
                    justify="center"
                    className="mb-4"
                    aria-label="Spin wheel modes"
                >
                    <Tabs.Tab value="personal">Personal</Tabs.Tab>
                    <Tabs.Tab value="shared">Shared</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="personal">
                    <Personal />
                </Tabs.Panel>
                <Tabs.Panel value="shared">
                    <Shared />
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
}
