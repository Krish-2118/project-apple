"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  BrainCircuit,
} from "lucide-react";

import { UserNav } from "@/components/dashboard/user-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import { IndiFarmIcon } from "@/components/icons";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/tools", icon: BrainCircuit, label: "AI Tools" },
  { href: "/dashboard/community", icon: Users, label: "Community" },
];

function MainNav() {
  const pathname = usePathname();
  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href}>
            <SidebarMenuButton
              isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
              tooltip={{ children: item.label, side: "right" }}
            >
              <item.icon />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1"></div>
      <UserNav />
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
              <IndiFarmIcon className="h-8 w-8 text-primary" />
              <span className="font-headline text-primary-foreground group-data-[collapsible=icon]:hidden">IndiFarm AI</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
