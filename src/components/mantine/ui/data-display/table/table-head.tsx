"use client";

import {Table as MantineTable} from "@mantine/core";
import type {ThHTMLAttributes} from "react";

export const TableHead = ({children, ...props}: ThHTMLAttributes<HTMLTableCellElement>) => (
    <MantineTable.Th {...props}>{children}</MantineTable.Th>
);
