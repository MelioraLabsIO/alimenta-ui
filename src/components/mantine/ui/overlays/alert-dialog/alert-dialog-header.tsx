"use client";

import type {ComponentProps} from "react";

export const AlertDialogHeader = ({className, ...props}: ComponentProps<"div">) => (
    <div className={className} {...props} />
);
