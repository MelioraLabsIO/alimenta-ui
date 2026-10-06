import { redirect } from "next/navigation";
import { AppShellLayout } from "@/components/layout/AppShellLayout";
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

    return <AppShellLayout>{children}</AppShellLayout>;
}
