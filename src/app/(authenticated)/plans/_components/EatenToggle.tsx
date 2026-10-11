"use client";

import { UnstyledButton } from "@mantine/core";
import { Check } from "lucide-react";

/** Round tick that flips a meal between planned and eaten. */
export function EatenToggle({
    eaten,
    color,
    size,
    onToggle,
}: {
    eaten: boolean;
    color: string;
    size: number;
    onToggle: () => void;
}) {
    const label = eaten ? "Mark as planned" : "Mark as eaten";

    return (
        <UnstyledButton
            aria-label={label}
            title={label}
            aria-pressed={eaten}
            onClick={(e) => {
                e.stopPropagation();
                onToggle();
            }}
            w={size}
            h={size}
            bg={eaten ? color : "transparent"}
            c={eaten ? "var(--act)" : "var(--tx3)"}
            style={{
                borderRadius: "var(--mantine-radius-pill)",
                border: `1.5px solid ${eaten ? color : "var(--bd2)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
            }}
        >
            <Check size={size - 7} strokeWidth={2.5} />
        </UnstyledButton>
    );
}
