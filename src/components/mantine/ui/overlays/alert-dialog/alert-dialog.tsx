"use client";

import { AlertContext, type RootProps } from "../internal/disclosure-context";

export function AlertDialog({
    open = false,
    onOpenChangeAction,
    children,
}: RootProps) {
    return (
        <AlertContext.Provider
            value={{
                open,
                setOpen: (nextOpen) => onOpenChangeAction?.(nextOpen),
            }}
        >
            {children}
        </AlertContext.Provider>
    );
}
