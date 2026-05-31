"use client";

import type {ComponentProps} from "react";

export const AlertDialogFooter = ({className, ...props}: ComponentProps<"div">) => (
    <div className={className} {...props} />
);
