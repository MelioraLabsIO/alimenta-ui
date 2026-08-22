"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNavSheet } from "./MobileNavSheet";
import { HeaderBrand } from "./HeaderBrand";
import { HeaderSearch } from "./HeaderSearch";
import { HeaderNotifications } from "./HeaderNotifications";
import { HeaderUserMenu } from "./HeaderUserMenu";

/**
 * The application's sticky top bar. Pure composition — every piece owns its
 * own state and data, so this file only decides what sits where: navigation
 * and identity on the left, search in the middle, account actions on the
 * right.
 */
export function AppHeader() {
    return (
        <header className="app-header sticky top-0 z-50 border-b border-border/50">
            <div className="flex h-16 items-center gap-3 px-4">
                <MobileNavSheet />
                <HeaderBrand />

                <HeaderSearch />

                <div className="ml-auto flex items-center gap-1">
                    <ThemeToggle />
                    <HeaderNotifications />
                    <HeaderUserMenu />
                </div>
            </div>
        </header>
    );
}
