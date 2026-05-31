"use client";

import {AlertContext, type RootProps} from "../internal/disclosure-context";

export function AlertDialog({open = false, onOpenChange, children}: RootProps) {
    return (
        <AlertContext.Provider value={{open, setOpen: (nextOpen) => onOpenChange?.(nextOpen)}}>
            {children}
        </AlertContext.Provider>
    );
}
