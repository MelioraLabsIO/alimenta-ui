// src/app/layout.tsx
import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import {ColorSchemeScript, MantineProvider} from "@mantine/core";
import {Notifications} from "@mantine/notifications";
import {alimentaTheme} from "@/lib/mantine/theme";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "./globals.css";
import ReactQueryProvider from "@/providers/QueryProvider";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Alimenta — Food & Wellness Discovery",
    description: "Discover what foods make you feel your best.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            <ColorSchemeScript defaultColorScheme="dark"/>
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <MantineProvider theme={alimentaTheme} defaultColorScheme="dark">
            <ReactQueryProvider>
                {children}
                <Notifications position="top-right"/>
                <ReactQueryDevtools initialIsOpen={false} />
            </ReactQueryProvider>
        </MantineProvider>
        </body>
        </html>
    );
}
