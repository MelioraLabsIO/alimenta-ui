"use client";

import {Switch as MantineSwitch} from "@mantine/core";
import type {ComponentProps} from "react";

type SwitchProps = Omit<ComponentProps<typeof MantineSwitch>, "onChange"> & {
    onCheckedChange?: (checked: boolean) => void;
};

export function Switch({onCheckedChange, ...props}: SwitchProps) {
    return <MantineSwitch {...props} onChange={(event) => onCheckedChange?.(event.currentTarget.checked)} />;
}
