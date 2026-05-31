"use client";

import {Table as MantineTable} from "@mantine/core";
import type {TableHTMLAttributes} from "react";

export const Table = ({children, ...props}: TableHTMLAttributes<HTMLTableElement>) => (
    <MantineTable {...props}>{children}</MantineTable>
);
