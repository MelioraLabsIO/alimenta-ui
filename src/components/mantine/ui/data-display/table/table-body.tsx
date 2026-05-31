"use client";

import {Table as MantineTable} from "@mantine/core";
import type {HTMLAttributes} from "react";

export const TableBody = ({children, ...props}: HTMLAttributes<HTMLTableSectionElement>) => (
    <MantineTable.Tbody {...props}>{children}</MantineTable.Tbody>
);
