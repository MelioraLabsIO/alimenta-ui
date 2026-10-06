"use client";

import { Tabs } from "@mantine/core";
import { ListPlus, Sparkles } from "lucide-react";
import { ManualForm } from "@/app/(authenticated)/log/ManualForm/ManualForm";
import { NaturalLanguageForm } from "@/app/(authenticated)/log/NaturalLanguageForm/NaturalLanguageForm";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LogMealPage() {
    return (
        <Tabs defaultValue="manual">
            <Tabs.List mb={12}>
                <Tabs.Tab value="manual" leftSection={<ListPlus size={15} />}>
                    Build it
                </Tabs.Tab>
                <Tabs.Tab value="natural" leftSection={<Sparkles size={15} />}>
                    Describe it
                </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="manual">
                <ManualForm />
            </Tabs.Panel>

            <Tabs.Panel value="natural">
                <NaturalLanguageForm />
            </Tabs.Panel>
        </Tabs>
    );
}
