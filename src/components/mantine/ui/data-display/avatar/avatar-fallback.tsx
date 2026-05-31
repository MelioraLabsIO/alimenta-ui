"use client";

import type {ComponentProps} from "react";

export const AvatarFallback = ({className, ...props}: ComponentProps<"span">) => (
    <span className={className} {...props} />
);
