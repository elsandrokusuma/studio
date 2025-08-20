
"use client"

import * as React from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1" />
      {/* Add User Menu or other header items here */}
    </header>
  )
}
