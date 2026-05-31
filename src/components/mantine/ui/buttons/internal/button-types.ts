"use client";

import * as React from "react";

export type Variant = "default" | "secondary" | "outline" | "ghost" | "destructive" | "subtle" | "light";
export type Size = "default" | "sm" | "lg" | "icon" | string;

export type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
    variant?: Variant;
    size?: Size;
    component?: React.ElementType;
    href?: string;
    asChild?: boolean;
    leftSection?: React.ReactNode;
    rightSection?: React.ReactNode;
};
