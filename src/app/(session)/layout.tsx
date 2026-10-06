import type { ReactNode } from "react";
import { Box } from "@mantine/core";

type Props = {
    children: ReactNode;
};

/**
 * Guest-reachable pages get no app chrome — just the page wash. Each page
 * supplies its own brand row and header.
 */
export default function SharedLayout({ children }: Props) {
    return (
        <Box
            component="main"
            mih="100dvh"
            c="var(--tx)"
            style={{
                background: "var(--wash)",
                backgroundAttachment: "fixed",
            }}
        >
            {children}
        </Box>
    );
}
