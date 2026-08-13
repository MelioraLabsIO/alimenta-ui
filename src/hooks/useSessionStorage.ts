"use client";

import { useCallback, useState } from "react";

function readSessionStorage(key: string): string | null {
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem(key);
}

/**
 * Reads and writes a single `sessionStorage` key, kept in sync with a piece
 * of React state so setting it re-renders the calling component. SSR-safe —
 * reads resolve to `null` on the server since `sessionStorage` doesn't exist
 * there.
 */
export function useSessionStorage(
    key: string
): [string | null, (value: string | null) => void] {
    const [value, setValue] = useState<string | null>(() =>
        readSessionStorage(key)
    );

    const setSessionStorageValue = useCallback(
        (next: string | null) => {
            if (typeof window !== "undefined") {
                if (next === null) {
                    window.sessionStorage.removeItem(key);
                } else {
                    window.sessionStorage.setItem(key, next);
                }
            }
            setValue(next);
        },
        [key]
    );

    return [value, setSessionStorageValue];
}
