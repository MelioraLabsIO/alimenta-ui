"use client";

import {DialogContext, type RootProps} from "../internal/disclosure-context";

export function Dialog({open = false, onOpenChange, children}: RootProps) {
    return (
        <DialogContext.Provider value={{open, setOpen: (nextOpen) => onOpenChange?.(nextOpen)}}>
            {children}
        </DialogContext.Provider>
    );
}
