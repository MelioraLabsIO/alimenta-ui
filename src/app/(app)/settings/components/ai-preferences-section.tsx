"use client";

import {useState} from "react";
import {Sparkles} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Text,
    Switch,
} from "@/components/mantine/ui";

const AI_PREFERENCE_ITEMS = [
    {
        id: "auto-extract",
        label: "Auto-extract nutrition from journal",
        description: "Automatically parse nutrition data when you log a meal via natural language.",
    },
    {
        id: "ask-before-save",
        label: "Ask before saving parsed meals",
        description: "Show a confirmation step before saving AI-parsed meals to your history.",
    },
] as const;

export function AiPreferencesSection() {
    const [preferences, setPreferences] = useState({
        autoExtract: true,
        askBeforeSave: false,
    });

    function handlePreferenceChange(key: keyof typeof preferences, checked: boolean) {
        setPreferences((prev) => ({
            ...prev,
            [key]: checked,
        }));
    }

    return (
        <Card className="border-border/50 bg-card/60">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-400" /> AI Preferences
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {AI_PREFERENCE_ITEMS.map((item) => {
                    const stateKey = item.id === "auto-extract" ? "autoExtract" : "askBeforeSave";

                    return (
                        <div key={item.id} className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <Text className="text-sm font-medium cursor-pointer">
                                    {item.label}
                                </Text>
                                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                            </div>
                            <Switch
                                id={item.id}
                                checked={preferences[stateKey]}
                                onCheckedChange={(checked) => handlePreferenceChange(stateKey, checked)}
                                className="shrink-0 mt-0.5"
                            />
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
