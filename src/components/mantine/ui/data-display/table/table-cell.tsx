"use client";

import {Table as MantineTable} from "@mantine/core";
import type {TdHTMLAttributes} from "react";

export const TableCell = ({children, ...props}: TdHTMLAttributes<HTMLTableCellElement>) => (
    <MantineTable.Td {...props}>{children}</MantineTable.Td>
);
