"use client";

import {Table as MantineTable} from "@mantine/core";
import type {HTMLAttributes} from "react";

export const TableRow = ({children, ...props}: HTMLAttributes<HTMLTableRowElement>) => (
    <MantineTable.Tr {...props}>{children}</MantineTable.Tr>
);
