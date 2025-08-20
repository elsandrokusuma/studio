
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  Warehouse,
  UserCircle,
  Settings,
  ClipboardCheck,
} from "lucide-react"

export function AppSidebar() {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-center group-data-[state=expanded]:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0" asChild>
            <Link href="/" aria-label="Home">
              <Warehouse className="size-5 text-primary" />
            </Link>
          </Button>
          <span className="font-semibold text-lg text-sidebar-foreground group-data-[state=collapsed]:hidden">StockPilot</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/")}
              tooltip={{ children: "Dashboard" }}
            >
              <Link href="/">
                <LayoutDashboard />
                <span className="group-data-[state=collapsed]:hidden">Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/inventory")}
              tooltip={{ children: "Inventory" }}
            >
              <Link href="/inventory">
                <Boxes />
                <span className="group-data-[state=collapsed]:hidden">Inventory</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/pre-orders")}
              tooltip={{ children: "Pre-Orders" }}
            >
              <Link href="/pre-orders">
                <ShoppingCart />
                <span className="group-data-[state=collapsed]:hidden">Pre-Orders</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/approval")}
              tooltip={{ children: "Approval" }}
            >
              <Link href="/approval">
                <ClipboardCheck />
                <span className="group-data-[state=collapsed]:hidden">Approval</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <Separator className="mb-2" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={{ children: "Account" }}>
              <UserCircle />
              <span className="group-data-[state=collapsed]:hidden">Account</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={{ children: "Settings" }}>
              <Settings />
              <span className="group-data-[state=collapsed]:hidden">Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
