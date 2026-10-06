// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ColorSchemeScript } from "@mantine/core";
// Mantine's stylesheets are imported from globals.css (as `styles.layer.css`)
// so they land in the `mantine` cascade layer — see the note at its top.
import "./globals.css";
import MantineThemeProvider from "@/providers/MantineThemeProvider";
import ReactQueryProvider from "@/providers/QueryProvider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import AuthUserProvider from "@/providers/AuthUserProvider";

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
                <ColorSchemeScript defaultColorScheme="dark" />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <MantineThemeProvider>
                    <ReactQueryProvider>
                        <AuthUserProvider>
                            {children}
                            <ReactQueryDevtools initialIsOpen={false} />
                        </AuthUserProvider>
                    </ReactQueryProvider>
                </MantineThemeProvider>
            </body>
        </html>
    );
}
