"use client";

import * as React from "react";

export type DisclosureContextValue = {
    open: boolean;
    setOpen: (open: boolean) => void;
};

export type RootProps = {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
};

export const DialogContext = React.createContext<DisclosureContextValue | null>(null);
export const SheetContext = React.createContext<DisclosureContextValue | null>(null);
export const AlertContext = React.createContext<DisclosureContextValue | null>(null);

export function useDisclosureContext(context: React.Context<DisclosureContextValue | null>) {
    const value = React.useContext(context);

    if (!value) {
        throw new Error("Disclosure component must be rendered inside its root.");
    }

    return value;
}
