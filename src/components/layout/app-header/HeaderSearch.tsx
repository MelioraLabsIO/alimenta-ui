"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/mantine/ui";

/**
 * Global search field. Presentational for now — it holds no value and has no
 * change handler, so typing in it does nothing until a search backend exists.
 */
export function HeaderSearch() {
    return (
        <div className="flex-1 max-w-md">
            <Input
                placeholder="Search meals, foods…"
                leftSection={
                    <Search className="h-3.5 w-3.5 text-muted-foreground" />
                }
                className="app-search"
            />
        </div>
    );
}
