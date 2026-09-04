"use client";

import Link from "next/link";
import { Leaf } from "lucide-react";

/**
 * Wordmark linking back to the dashboard. Hidden below `md`, where
 * `MobileNavSheet`'s trigger occupies this slot and the drawer's own header
 * carries the name instead.
 */
export function HeaderBrand() {
    return (
        <Link
            href="/"
            className="hidden md:flex items-center gap-2.5 font-bold text-lg text-foreground shrink-0"
        >
            <span className="brand-mark">
                <Leaf className="h-4 w-4" />
            </span>
            <span className="tracking-tight">Alimenta</span>
        </Link>
    );
}
