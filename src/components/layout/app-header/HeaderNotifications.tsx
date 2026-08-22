"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/mantine/ui";

/**
 * Notification bell. The unread dot is currently unconditional and the button
 * opens nothing — there's no notifications feed behind it yet.
 */
export function HeaderNotifications() {
    return (
        <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />
        </Button>
    );
}
