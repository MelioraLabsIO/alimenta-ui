"use client";

import {Box} from "@mantine/core";
import type {HTMLAttributes} from "react";

type DivProps = HTMLAttributes<HTMLDivElement>;

export const CardContent = ({className, ...props}: DivProps) => (
    <Box className={className} p="md" {...props} />
);
