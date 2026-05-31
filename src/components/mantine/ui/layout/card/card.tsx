"use client";

import * as React from "react";
import {Card as MantineCard} from "@mantine/core";

type CardProps = React.PropsWithChildren<{className?: string} & Record<string, unknown>>;

export function Card({className, children, ...props}: CardProps) {
    const MantineCardComponent = MantineCard as React.ElementType;

    return (
        <MantineCardComponent className={["app-card", className].filter(Boolean).join(" ")} {...props}>
            {children}
        </MantineCardComponent>
    );
}
