"use client";

import {Divider} from "@mantine/core";
import type {ComponentProps} from "react";

export const Separator = ({className, ...props}: ComponentProps<typeof Divider>) => (
    <Divider className={className} {...props} />
);
