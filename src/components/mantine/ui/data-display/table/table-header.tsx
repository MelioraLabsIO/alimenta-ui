"use client";

import {Table as MantineTable} from "@mantine/core";
import type {HTMLAttributes} from "react";

export const TableHeader = ({children, ...props}: HTMLAttributes<HTMLTableSectionElement>) => (
    <MantineTable.Thead {...props}>{children}</MantineTable.Thead>
);
