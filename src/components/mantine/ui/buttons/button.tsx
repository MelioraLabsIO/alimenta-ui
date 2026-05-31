"use client";

import * as React from "react";
import {Button as MantineButton} from "@mantine/core";
import type {ButtonProps} from "./internal/button-types";
import {buttonColor, buttonSize, buttonVariant} from "./internal/button-utils";

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    {variant, size, className, children, asChild, ...props},
    ref,
) {
    if (asChild && React.isValidElement(children)) {
        const childProps = children.props as {className?: string};

        return React.cloneElement(children, {
            className: [childProps.className, className].filter(Boolean).join(" "),
            onClick: props.onClick,
        } as Record<string, unknown>);
    }

    const iconProps = size === "icon" ? {px: 0, w: 34, h: 34} : {};
    const MantineButtonComponent = MantineButton as React.ElementType;

    return (
        <MantineButtonComponent
            ref={ref}
            variant={buttonVariant(variant)}
            color={buttonColor(variant)}
            size={buttonSize(size)}
            className={className}
            {...iconProps}
            {...props}
        >
            {children}
        </MantineButtonComponent>
    );
});
