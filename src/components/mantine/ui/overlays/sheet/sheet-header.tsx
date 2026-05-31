"use client";

import type {ComponentProps} from "react";

export const SheetHeader = ({className, ...props}: ComponentProps<"div">) => (
    <div className={className} {...props} />
);
