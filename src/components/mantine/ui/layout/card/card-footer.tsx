"use client";

import {Box} from "@mantine/core";
import type {HTMLAttributes} from "react";

type DivProps = HTMLAttributes<HTMLDivElement>;

export const CardFooter = ({className, ...props}: DivProps) => (
    <Box className={className} px="md" pb="md" {...props} />
);
