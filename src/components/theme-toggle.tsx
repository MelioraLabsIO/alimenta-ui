"use client";

import {useEffect, useState} from "react";
import { Moon, Sun } from "lucide-react";
import {useComputedColorScheme, useMantineColorScheme} from "@mantine/core";
import { Button } from "@/components/mantine/ui";

export function ThemeToggle() {
  const {setColorScheme} = useMantineColorScheme();
  const colorScheme = useComputedColorScheme("dark", {getInitialValueInEffect: true});
  const [mounted, setMounted] = useState(false);
  const isDark = colorScheme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setColorScheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {!mounted ? (
        <span className="h-4 w-4" aria-hidden="true" />
      ) : isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}
