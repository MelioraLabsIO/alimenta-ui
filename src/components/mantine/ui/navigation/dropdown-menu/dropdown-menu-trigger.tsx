"use client";

import {Menu} from "@mantine/core";
import type {ReactElement} from "react";

export const DropdownMenuTrigger = ({children}: {asChild?: boolean; children: ReactElement}) => (
    <Menu.Target>{children}</Menu.Target>
);
