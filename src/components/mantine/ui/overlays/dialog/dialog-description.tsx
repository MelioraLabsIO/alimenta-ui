"use client";

import type {ComponentProps} from "react";

export const DialogDescription = ({className, ...props}: ComponentProps<"p">) => (
    <p className={className} {...props} />
);
