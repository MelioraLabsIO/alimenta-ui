"use client";

import type {ComponentProps} from "react";

export const AlertDialogTitle = ({className, ...props}: ComponentProps<"h2">) => (
    <h2 className={className} {...props} />
);
