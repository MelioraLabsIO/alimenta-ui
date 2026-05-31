"use client";

import {Box} from "@mantine/core";
import type {HTMLAttributes} from "react";

type DivProps = HTMLAttributes<HTMLDivElement>;

export const CardHeader = ({className, ...props}: DivProps) => (
    <Box className={className} px="md" pt="md" {...props} />
);
