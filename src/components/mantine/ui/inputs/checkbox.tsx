"use client";

import {Checkbox as MantineCheckbox} from "@mantine/core";
import type {ComponentProps} from "react";

type CheckboxProps = Omit<ComponentProps<typeof MantineCheckbox>, "onChange"> & {
    onCheckedChange?: (checked: boolean) => void;
};

export function Checkbox({onCheckedChange, ...props}: CheckboxProps) {
    return <MantineCheckbox {...props} onChange={(event) => onCheckedChange?.(event.currentTarget.checked)} />;
}
