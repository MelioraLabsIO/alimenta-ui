"use client";

import type {ComponentProps} from "react";

export const CardTitle = ({className, ...props}: ComponentProps<"h3">) => (
    <h3 className={className} {...props} />
);
