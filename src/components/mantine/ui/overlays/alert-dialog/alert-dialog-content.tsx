"use client";

import {Modal} from "@mantine/core";
import type {ReactNode} from "react";
import {AlertContext, useDisclosureContext} from "../internal/disclosure-context";

export function AlertDialogContent({children}: {children: ReactNode}) {
    const {open, setOpen} = useDisclosureContext(AlertContext);

    return (
        <Modal opened={open} onClose={() => setOpen(false)} centered size="sm">
            {children}
        </Modal>
    );
}
