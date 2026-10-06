"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import {
    ActionIcon,
    Box,
    useComputedColorScheme,
    useMantineColorScheme,
} from "@mantine/core";

export function ThemeToggle() {
    const { setColorScheme } = useMantineColorScheme();
    const colorScheme = useComputedColorScheme("dark", {
        getInitialValueInEffect: true,
    });
    const [mounted, setMounted] = useState(false);
    const isDark = colorScheme === "dark";

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <ActionIcon
            onClick={() => setColorScheme(isDark ? "light" : "dark")}
            aria-label="Toggle theme"
        >
            {!mounted ? (
                <Box w={16} h={16} aria-hidden="true" />
            ) : isDark ? (
                <Sun size={16} />
            ) : (
                <Moon size={16} />
            )}
        </ActionIcon>
    );
}
