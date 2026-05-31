"use client";

import * as React from "react";
import {Menu} from "@mantine/core";

export const DropdownMenuItem = ({
    asChild,
    children,
    onSelect,
    ...props
}: {
    asChild?: boolean;
    children: React.ReactNode;
    onSelect?: () => void;
    className?: string;
}) => {
    const MenuItem = Menu.Item as React.ElementType;

    if (asChild && React.isValidElement(children)) {
        return <MenuItem component={children.type} {...(children.props as Record<string, unknown>)} />;
    }

    return <MenuItem onClick={onSelect} {...props}>{children}</MenuItem>;
};
