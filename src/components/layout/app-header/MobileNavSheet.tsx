"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import {
    Button,
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/mantine/ui";
import { SidebarNav } from "@/components/layout/sidebar-nav";

/**
 * Hamburger trigger and the drawer it opens, holding the same `SidebarNav`
 * the persistent sidebar renders. Hidden from `md` up, where that sidebar
 * takes over. Owns its open state so it can close itself once a link is
 * followed — nothing outside the header needs to drive it.
 */
export function MobileNavSheet() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChangeAction={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="px-4 pt-4 pb-2 border-b border-border/50">
                    <SheetTitle className="text-left text-lg font-bold text-foreground">
                        Alimenta
                    </SheetTitle>
                </SheetHeader>
                <SidebarNav onNavigate={() => setOpen(false)} />
            </SheetContent>
        </Sheet>
    );
}
