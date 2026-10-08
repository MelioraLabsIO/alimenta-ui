"use client";

import { TextInput } from "@mantine/core";
import { Search } from "lucide-react";

/**
 * Global search pill. Presentational for now — it holds no value and has no
 * change handler, so typing in it does nothing until a search backend exists.
 */
export function HeaderSearch() {
    return (
        <TextInput
            placeholder="Search meals, foods"
            leftSection={<Search size={15} />}
            aria-label="Search"
            w={250}
            radius="pill"
            visibleFrom="lg"
            styles={{
                input: {
                    height: 42,
                    backgroundColor: "var(--glass)",
                    borderColor: "var(--bd)",
                    backdropFilter: "blur(20px)",
                },
            }}
        />
    );
}
