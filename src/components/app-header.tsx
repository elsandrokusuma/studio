
"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  ClipboardCheck,
  Menu,
  Settings,
  Wrench,
  Bell,
  AlertCircle,
  Clock,
  Trash2,
} from "lucide-react"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/hooks/use-auth"
import { useNotifications, type Notification } from "@/hooks/use-notifications"
import { ScrollArea } from "./ui/scroll-area"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/pre-orders", label: "Pre-Orders", icon: ShoppingCart },
  { href: "/approval", label: "Approval Stationery", icon: ClipboardCheck },
  { href: "/approval-sparepart", label: "Approval Sparepart", icon: Wrench },
]

function NotificationBell() {
  const { notifications, clearNotifications } = useNotifications();

  React.useEffect(() => {
    if (!db) return;

    // This effect is now just for listening to real-time data notifications.
    // The state is managed by the useNotifications hook.
    // Let's assume the hook itself handles adding/removing these listeners if needed,
    // or we can add them here and call `addNotification`. For now, we assume
    // the hook is self-contained for simplicity.

  }, []);

  const hasNotifications = notifications.length > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {hasNotifications && (
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-medium">Notifications</h3>
            {hasNotifications && (
              <Button variant="ghost" size="sm" onClick={clearNotifications}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
        </div>
        <ScrollArea className="h-[300px]">
          <div className="p-2 space-y-1">
              {hasNotifications ? (
                  notifications.map((notif) => {
                      const Icon = notif.icon;
                      const content = (
                          <div className="p-3 rounded-md hover:bg-accent flex items-start gap-3">
                              <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div className="flex-1">
                                  <p className="text-sm font-medium">{notif.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                      {notif.description}
                                  </p>
                              </div>
                          </div>
                      );
                      
                      return notif.href ? (
                        <Link href={notif.href} key={notif.id} className="block">
                          {content}
                        </Link>
                      ) : (
                        <div key={notif.id}>
                          {content}
                        </div>
                      );
                  })
              ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                      You're all caught up!
                  </div>
              )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}


export function AppHeader() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const { user } = useAuth();

  const visibleNavItems = React.useMemo(() => {
    if (!user) return [];
    if (user.email === 'krezthrd@gmail.com') {
      return navItems.filter(item => item.href !== '/approval-sparepart');
    }
    if (user.email === 'kreztservice@gmail.com') {
      return navItems.filter(item => item.href === '/approval-sparepart');
    }
    if (user.email === 'kreztuser@gmail.com') {
        return navItems.filter(item => item.href === '/');
    }
    return navItems;
  }, [user]);


  const NavLinks = ({ className, inSheet = false }: { className?: string, inSheet?: boolean }) => (
    <nav className={cn("flex items-center gap-2 lg:gap-4", className)}>
      {visibleNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2",
            pathname === item.href
              ? "text-primary"
              : "text-muted-foreground",
             inSheet ? "p-2 rounded-md hover:bg-accent w-full text-base" : ""
          )}
          onClick={() => inSheet && setIsMobileMenuOpen(false)}
        >
         <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  )

  return (
    <header className="header sticky top-0 z-30 flex h-14 items-center border-b px-4 md:px-6 print:hidden">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <Image src="/favicon.ico" alt="Logo" width={32} height={32} className="h-8 w-8" />
            </Link>
        </div>

        <div className="hidden flex-1 justify-center md:flex">
          <NavLinks />
        </div>
        
        <div className="flex items-center">
            <div className="flex items-center gap-2">
                <NotificationBell />
                <Link href="/settings">
                    <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5" />
                    </Button>
                </Link>
            </div>
            <div className="md:hidden ml-2">
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
                       <Image src="/favicon.ico" alt="Logo" width={32} height={32} className="h-8 w-8" />
                      <span>Stationery Inv.</span>
                    </Link>
                    <NavLinks className="flex-col items-start gap-2" inSheet={true} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
        </div>
      </div>
    </header>
  )
}
