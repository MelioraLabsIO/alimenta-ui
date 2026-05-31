"use client";

import type {ComponentProps} from "react";

export const DialogTitle = ({className, ...props}: ComponentProps<"h2">) => (
    <h2 className={className} {...props} />
);
