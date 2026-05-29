"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Leaf, Menu, Search } from "lucide-react";
import { Button } from "@/components/mantine/ui";
import { Input } from "@/components/mantine/ui";
import { Avatar, AvatarFallback } from "@/components/mantine/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/mantine/ui";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/mantine/ui";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { logout } from "@/app/login/actions";

export function AppHeader() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <header className="app-header sticky top-0 z-50 border-b border-border/50">
      <div className="flex h-16 items-center gap-3 px-4">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="px-4 pt-4 pb-2 border-b border-border/50">
              <SheetTitle className="text-left text-lg font-bold text-foreground">
                Alimenta
              </SheetTitle>
            </SheetHeader>
            <SidebarNav onNavigate={() => setSheetOpen(false)} />
          </SheetContent>
        </Sheet>

        <Link href="/" className="hidden md:flex items-center gap-2.5 font-bold text-lg text-foreground shrink-0">
          <span className="brand-mark">
            <Leaf className="h-4 w-4" />
          </span>
          <span className="tracking-tight">Alimenta</span>
        </Link>

        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search meals, foods…"
            leftSection={<Search className="h-3.5 w-3.5 text-muted-foreground" />}
            className="app-search"
          />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full app-avatar-button">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs bg-primary/20 text-primary font-semibold">
                    EH
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-sm">Eric Hernandez</span>
                  <span className="text-xs text-muted-foreground">eric@example.com</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive cursor-pointer"
                onSelect={() => logout()}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
