// src/app/(app)/app/layout.tsx
<<<<<<< HEAD
import {AppHeader} from "@/components/layout/app-header";
import {SidebarNav} from "@/components/layout/sidebar-nav";

export default function AppLayout({children}: { children: React.ReactNode }) {
    return (
        <div className="app-shell min-h-screen bg-background text-foreground flex flex-col">
            <AppHeader/>
            <div className="flex flex-1 overflow-hidden">
                <aside className="app-sidebar hidden md:flex w-56 shrink-0 flex-col border-r border-border/50">
                    <SidebarNav/>
=======
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="app-shell min-h-screen bg-background text-foreground flex flex-col">
            <AppHeader />
            <div className="flex flex-1 overflow-hidden">
                <aside className="app-sidebar hidden md:flex w-56 shrink-0 flex-col border-r border-border/50">
                    <SidebarNav />
>>>>>>> 9fdd6d91779ebf4a816aef2a1279b597615a88f7
                </aside>
                <main className="app-main flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
