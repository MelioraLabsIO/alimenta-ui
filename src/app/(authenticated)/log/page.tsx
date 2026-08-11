"use client";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/mantine/ui";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/mantine/ui";
import { Sparkles } from "lucide-react";
import { ManualForm } from "@/app/(authenticated)/log/ManualForm/ManualForm";
import { NaturalLanguageForm } from "@/app/(authenticated)/log/NaturalLanguageForm/NaturalLanguageForm";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LogMealPage() {
    return (
        <section className="max-w-2xl mx-auto space-y-6">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">Log Meal</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Add a meal manually or describe it in plain language.
                </p>
            </header>

            <Tabs defaultValue="manual">
                <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="manual" className="flex-1 sm:flex-none">
                        Manual
                    </TabsTrigger>
                    <TabsTrigger
                        value="natural"
                        className="flex-1 sm:flex-none"
                    >
                        Natural Language
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="mt-6">
                    <Card className="border-border/50 bg-card/60">
                        <CardContent className="p-6">
                            <ManualForm />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="natural" className="mt-6">
                    <Card className="border-border/50 bg-card/60">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-emerald-400" />
                                AI-Powered Parsing
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <NaturalLanguageForm />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </section>
    );
}
