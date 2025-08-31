"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  ClipboardCheck,
  Warehouse,
  Menu,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/pre-orders", label: "Pre-Orders", icon: ShoppingCart },
  { href: "/approval", label: "Approval", icon: ClipboardCheck },
]

export function AppHeader() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const NavLinks = ({ className, inSheet = false }: { className?: string, inSheet?: boolean }) => (
    <nav className={cn("flex items-center gap-2 lg:gap-4", className)}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2",
            pathname === item.href
              ? "text-primary"
              : "text-muted-foreground",
             inSheet ? "p-2 rounded-md hover:bg-accent w-full" : ""
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        >
         <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  )

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 lg:gap-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Warehouse className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline-block">Stationery Inventory</span>
        </Link>
         <div className="hidden md:flex">
            <NavLinks />
        </div>
      </div>


      <div className="md:hidden flex-1 flex justify-end">
         <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="flex flex-col gap-6 pt-8">
               <Link href="/" className="flex items-center gap-2 font-semibold text-lg px-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <Warehouse className="h-6 w-6 text-primary" />
                  <span>Stationery Inventory</span>
                </Link>
              <NavLinks className="flex-col items-start gap-2" inSheet={true} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
