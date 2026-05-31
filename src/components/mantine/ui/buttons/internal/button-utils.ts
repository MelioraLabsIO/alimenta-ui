"use client";

import {type ButtonProps as MantineButtonProps} from "@mantine/core";
import type {Size, Variant} from "./button-types";

export function buttonVariant(variant?: Variant): MantineButtonProps["variant"] {
    switch (variant) {
        case "outline":
            return "outline";
        case "ghost":
            return "subtle";
        case "secondary":
            return "light";
        case "destructive":
            return "filled";
        case "subtle":
            return "subtle";
        case "light":
            return "light";
        default:
            return "filled";
    }
}

export function buttonColor(variant?: Variant) {
    return variant === "destructive" ? "red" : "alimenta";
}

export function buttonSize(size?: Size): MantineButtonProps["size"] {
    if (size === "lg") return "md";
    if (size === "sm" || size === "icon") return "xs";
    return "sm";
}
