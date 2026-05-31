"use client";

import {Modal} from "@mantine/core";
import type {ReactNode} from "react";
import {DialogContext, useDisclosureContext} from "../internal/disclosure-context";

export function DialogContent({className, children}: {className?: string; children: ReactNode}) {
    const {open, setOpen} = useDisclosureContext(DialogContext);

    return (
        <Modal opened={open} onClose={() => setOpen(false)} centered size="lg" className={className}>
            {children}
        </Modal>
    );
}
