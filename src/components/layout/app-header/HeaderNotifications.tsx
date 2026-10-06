"use client";

import { ActionIcon, Indicator } from "@mantine/core";
import { Bell } from "lucide-react";

/**
 * Notification bell. The unread dot is currently unconditional and the button
 * opens nothing — there's no notifications feed behind it yet.
 */
export function HeaderNotifications() {
    return (
        <Indicator
            color="alimenta"
            size={7}
            offset={9}
            withBorder
            styles={{ indicator: { borderColor: "var(--sf)" } }}
        >
            <ActionIcon aria-label="Notifications">
                <Bell size={16} />
            </ActionIcon>
        </Indicator>
    );
}
