"use client";

import {Drawer} from "@mantine/core";
import type {ReactNode} from "react";
import {SheetContext, useDisclosureContext} from "../internal/disclosure-context";

export function SheetContent({
    side = "left",
    className,
    children,
}: {
    side?: "left" | "right" | "top" | "bottom";
    className?: string;
    children: ReactNode;
}) {
    const {open, setOpen} = useDisclosureContext(SheetContext);

    return (
        <Drawer opened={open} onClose={() => setOpen(false)} position={side} size={260} className={className}>
            {children}
        </Drawer>
    );
}
