"use client";

import { SheetContext, type RootProps } from "../internal/disclosure-context";

export function Sheet({
    open = false,
    onOpenChangeAction,
    children,
}: RootProps) {
    return (
        <SheetContext.Provider
            value={{
                open,
                setOpen: (nextOpen) => onOpenChangeAction?.(nextOpen),
            }}
        >
            {children}
        </SheetContext.Provider>
    );
}
