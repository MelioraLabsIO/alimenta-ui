// src/app/layout.tsx
import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
// import {QueryProvider} from "@/components/query-provider";
import {ThemeProvider} from "@/components/theme-provider";
import {Toaster} from "@/components/ui/sonner";
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
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            <ReactQueryProvider>
                {children}
                <Toaster richColors position="top-right"/>
                <ReactQueryDevtools initialIsOpen={false} />
            </ReactQueryProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
