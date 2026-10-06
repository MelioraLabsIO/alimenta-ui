"use client";

import type { ReactNode } from "react";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { alimentaTheme } from "@/lib/mantine/theme";

/**
 * Owns `MantineProvider`. The theme contains functions (variant resolver,
 * `vars`/`styles` callbacks), which can't cross the server→client boundary as
 * a prop, so the provider has to be a client module that imports the theme
 * itself.
 */
export default function MantineThemeProvider({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <MantineProvider theme={alimentaTheme} defaultColorScheme="dark">
            {children}
            <Notifications
                position="top-right"
                containerWidth={340}
                autoClose={3600}
            />
        </MantineProvider>
    );
}
