"use client";

import * as React from "react";
import {Badge as MantineBadge} from "@mantine/core";

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "secondary" | "outline" | "destructive" | "light" | "filled";
    color?: string;
};

export function Badge({variant = "light", color, ...props}: BadgeProps) {
    const MantineBadgeComponent = MantineBadge as React.ElementType;

    return (
        <MantineBadgeComponent
            variant={variant === "secondary" ? "light" : variant === "outline" ? "outline" : "light"}
            color={color ?? (variant === "destructive" ? "red" : "alimenta")}
            radius="sm"
            tt="none"
            {...props}
        />
    );
}
