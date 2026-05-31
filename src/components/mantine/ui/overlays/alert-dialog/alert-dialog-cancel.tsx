"use client";

import type {ReactNode} from "react";
import {Button} from "../../buttons/button";
import {AlertContext, useDisclosureContext} from "../internal/disclosure-context";

export const AlertDialogCancel = ({children}: {children: ReactNode}) => {
    const {setOpen} = useDisclosureContext(AlertContext);

    return <Button variant="outline" onClick={() => setOpen(false)}>{children}</Button>;
};
