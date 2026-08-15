import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { getCurrentUserServer } from "@/lib/supabase/user";

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUserServer();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="app-shell min-h-screen bg-background text-foreground flex flex-col">
            <AppHeader />
            <div className="flex flex-1 overflow-hidden">
                <aside className="app-sidebar hidden md:flex w-56 shrink-0 flex-col border-r border-border/50">
                    <SidebarNav />
                </aside>
                <main className="app-main flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
