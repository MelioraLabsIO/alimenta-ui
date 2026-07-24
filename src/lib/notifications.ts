"use client";

import {notifications} from "@mantine/notifications";
import type {ReactNode} from "react";

type ToastOptions = {
    description?: ReactNode;
};

export const toast = {
    success(message: string, options?: ToastOptions) {
        notifications.show({
            title: message,
            message: options?.description,
            color: "alimenta",
        });
    },
    error(message: string, options?: ToastOptions) {
        notifications.show({
            title: message,
            message: options?.description,
            color: "red",
        });
    },
    info(message: string, options?: ToastOptions) {
        notifications.show({
            title: message,
            message: options?.description,
            color: "blue",
        });
    },
};
