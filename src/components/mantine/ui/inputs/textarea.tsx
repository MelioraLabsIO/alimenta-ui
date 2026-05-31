"use client";

import * as React from "react";
import {Textarea as MantineTextarea} from "@mantine/core";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<typeof MantineTextarea>>(
    function Textarea(props, ref) {
        return <MantineTextarea ref={ref} {...props} />;
    },
);
