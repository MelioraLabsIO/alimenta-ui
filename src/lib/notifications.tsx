"use client";

import { notifications } from "@mantine/notifications";
import { Check, CircleAlert, Info, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

type ToastOptions = {
    description?: ReactNode;
};

const ICON_SIZE = 15;

/**
 * Toasts in the design's shape: a glass card with a tinted icon tile. The
 * Notification styling itself lives in `globals.css`; this just picks the
 * tile color and glyph per kind.
 */
export const toast = {
    success(message: string, options?: ToastOptions) {
        notifications.show({
            title: message,
            message: options?.description,
            color: "alimenta",
            icon: <Check size={ICON_SIZE} className="text-act" />,
        });
    },
    error(message: string, options?: ToastOptions) {
        notifications.show({
            title: message,
            message: options?.description,
            color: "rose",
            icon: <CircleAlert size={ICON_SIZE} className="text-white" />,
        });
    },
    info(message: string, options?: ToastOptions) {
        notifications.show({
            title: message,
            message: options?.description,
            color: "sky",
            icon: <Info size={ICON_SIZE} className="text-white" />,
        });
    },
    /** Neutral tile — for "deleted"-style messages that offer an undo. */
    undo(message: string, options?: ToastOptions) {
        notifications.show({
            title: message,
            message: options?.description,
            color: "gray",
            autoClose: 5200,
            icon: <Trash2 size={ICON_SIZE} className="text-tx" />,
            styles: { icon: { backgroundColor: "var(--sf2)" } },
        });
    },
};
