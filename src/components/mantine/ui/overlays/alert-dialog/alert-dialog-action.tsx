"use client";

import type {ReactNode} from "react";
import {Button} from "../../buttons/button";

export const AlertDialogAction = ({
    children,
    onClick,
    className,
}: {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
}) => (
    <Button variant="destructive" className={className} onClick={onClick}>
        {children}
    </Button>
);
