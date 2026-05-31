"use client";

import {SheetContext, type RootProps} from "../internal/disclosure-context";

export function Sheet({open = false, onOpenChange, children}: RootProps) {
    return (
        <SheetContext.Provider value={{open, setOpen: (nextOpen) => onOpenChange?.(nextOpen)}}>
            {children}
        </SheetContext.Provider>
    );
}
