"use client";

import * as React from "react";
import {Button} from "../../buttons/button";
import {DialogContext, useDisclosureContext} from "../internal/disclosure-context";

export function DialogTrigger({asChild, children}: {asChild?: boolean; children: React.ReactElement}) {
    const {setOpen} = useDisclosureContext(DialogContext);

    if (asChild) {
        return React.cloneElement(children, {onClick: () => setOpen(true)} as Record<string, unknown>);
    }

    return <Button onClick={() => setOpen(true)}>{children}</Button>;
}
