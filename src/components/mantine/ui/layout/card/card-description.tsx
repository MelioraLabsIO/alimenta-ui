"use client";

import type {ComponentProps} from "react";

export const CardDescription = ({className, ...props}: ComponentProps<"p">) => (
    <p className={className} {...props} />
);
