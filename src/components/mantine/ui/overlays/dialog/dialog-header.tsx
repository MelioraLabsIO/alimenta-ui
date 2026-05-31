"use client";

import type {ComponentProps} from "react";

export const DialogHeader = ({className, ...props}: ComponentProps<"div">) => (
    <div className={className} {...props} />
);
