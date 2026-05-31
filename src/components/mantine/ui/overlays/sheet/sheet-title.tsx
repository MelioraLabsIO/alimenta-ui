"use client";

import type {ComponentProps} from "react";

export const SheetTitle = ({className, ...props}: ComponentProps<"h2">) => (
    <h2 className={className} {...props} />
);
