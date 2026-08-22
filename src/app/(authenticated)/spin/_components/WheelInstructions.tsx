"use client";

import { Users, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/mantine/ui";

export type WheelInstructionStep = {
    icon: LucideIcon;
    title: string;
    description: string;
};

/**
 * "How it works" card shown under the wheel. The steps differ between
 * Personal and Shared modes, so each page supplies its own — the card itself
 * is identical in both, which is what keeps the two columns balanced.
 */
export function WheelInstructions({ steps }: { steps: WheelInstructionStep[] }) {
    return (
        <Card className="border-border/50 bg-card/60">
            <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Users
                        className="h-4 w-4 text-primary"
                        aria-hidden="true"
                    />
                    <span className="text-sm font-semibold">How it works</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {steps.map(({ icon: Icon, title, description }) => (
                        <div key={title} className="space-y-1">
                            <div className="flex items-center gap-1.5">
                                <Icon
                                    className="h-3.5 w-3.5 text-primary shrink-0"
                                    aria-hidden="true"
                                />
                                <p className="text-xs font-semibold text-foreground">
                                    {title}
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground leading-snug">
                                {description}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
