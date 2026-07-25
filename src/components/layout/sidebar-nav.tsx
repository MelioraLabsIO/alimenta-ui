"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {
    LayoutDashboard,
    PlusCircle,
    History,
    LineChart,
    CalendarDays,
    Settings,
    Dices,
} from "lucide-react";
import {Badge} from "@/components/mantine/ui";

const navItems = [
    {href: "/", label: "Dashboard", icon: LayoutDashboard},
    {href: "/log", label: "Log Meal", icon: PlusCircle},
    {href: "/spin", label: "Spin Wheel", icon: Dices},
    {href: "/history", label: "History", icon: History},
    {href: "/insights", label: "Insights", icon: LineChart},
    {href: "/plans", label: "Plans", icon: CalendarDays, soon: true},
    {href: "/settings", label: "Settings", icon: Settings},
];

export function SidebarNav({onNavigate}: { onNavigate?: () => void }) {
    const pathname = usePathname();

    return (
        <nav className="flex flex-col gap-1 px-2 py-4">
            {navItems.map(({href, label, icon: Icon, soon}) => {
                const active = pathname === href;
                return (
                    <Link
                        key={href}
                        href={soon ? "#" : href}
                        onClick={onNavigate}
                        className={[
                            "nav-link relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                            active
                                ? "is-active bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            soon ? "pointer-events-none opacity-50" : "",
                        ].join(" ")}
                    >
                        <Icon className="h-4 w-4 shrink-0"/>
                        <span className="flex-1">{label}</span>
                        {soon && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                Soon
                            </Badge>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
