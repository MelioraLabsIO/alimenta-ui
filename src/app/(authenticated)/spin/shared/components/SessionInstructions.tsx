"use client";

import { Link2, UtensilsCrossed, Dices } from "lucide-react";
import { Card, CardContent } from "@/components/mantine/ui";
import { Users } from "lucide-react";

const STEPS = [
    {
        icon: Link2,
        title: "1. Share the code",
        description: "Invite others to join using the code or QR.",
    },
    {
        icon: UtensilsCrossed,
        title: "2. Add your meal",
        description: "Everyone adds one meal they're in the mood for.",
    },
    {
        icon: Dices,
        title: "3. Spin to decide",
        description: "The host spins and we all eat the winner!",
    },
] as const;

/**
 * Optional informational card shown below the wheel explaining how a shared
 * session works.
 */
export function SessionInstructions(props: { isHost: boolean }) {
    if (!props.isHost) return null;

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
                    {STEPS.map(({ icon: Icon, title, description }) => (
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
