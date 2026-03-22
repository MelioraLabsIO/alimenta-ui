"use client";

import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Sparkles} from "lucide-react";
import {NaturalLanguageForm} from "@/app/(app)/log/NaturalLanguageForm";
import {ManualForm} from "@/app/(app)/log/ManualForm";


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LogMealPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Log Meal</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Add a meal manually or describe it in plain language.
                </p>
            </div>

            <Tabs defaultValue="manual">
                <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="manual" className="flex-1 sm:flex-none">Manual</TabsTrigger>
                    <TabsTrigger value="natural" className="flex-1 sm:flex-none">Natural Language</TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="mt-6">
                    <Card className="border-border/50 bg-card/60">
                        <CardContent className="p-6">
                            <ManualForm/>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="natural" className="mt-6">
                    <Card className="border-border/50 bg-card/60">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-emerald-400"/>
                                AI-Powered Parsing
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <NaturalLanguageForm/>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
