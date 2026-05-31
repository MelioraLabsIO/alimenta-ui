"use client";

import * as React from "react";
import {TextInput} from "@mantine/core";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof TextInput>>(function Input(
    props,
    ref,
) {
    return <TextInput ref={ref} {...props} />;
});
