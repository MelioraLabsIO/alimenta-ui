"use client";

import { DialogContext, type RootProps } from "../internal/disclosure-context";

export function Dialog({
    open = false,
    onOpenChangeAction,
    children,
}: RootProps) {
    return (
        <DialogContext.Provider
            value={{
                open,
                setOpen: (nextOpen) => onOpenChangeAction?.(nextOpen),
            }}
        >
            {children}
        </DialogContext.Provider>
    );
}
