"use client";

import {Menu} from "@mantine/core";
import type {ReactNode} from "react";

export const DropdownMenuContent = ({
    children,
}: {
    align?: string;
    className?: string;
    children: ReactNode;
}) => <Menu.Dropdown>{children}</Menu.Dropdown>;
