"use client";

import type {ComponentProps} from "react";

export const AlertDialogDescription = ({className, ...props}: ComponentProps<"p">) => (
    <p className={className} {...props} />
);
