
"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  Menu,
  Settings,
  Wrench,
  Bell,
  Trash2,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/hooks/use-auth"
import { useNotifications } from "@/hooks/use-notifications"
import { ScrollArea } from "./ui/scroll-area"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/use-theme"

const translations = {
    en: {
        dashboard: "Dashboard",
        inventory: "Inventory",
        preOrder: "Pre-Order & Approval",
        sparepart: "Sparepart Approval",
        notifications: "Notifications",
        clearAll: "Clear All",
        allCaughtUp: "You're all caught up!",
        toggleMenu: "Toggle navigation menu",
        appName: "Stationery Inv."
    },
    id: {
        dashboard: "Dasbor",
        inventory: "Inventaris",
        preOrder: "Pra-Pesan & Persetujuan",
        sparepart: "Persetujuan Sparepart",
        notifications: "Notifikasi",
        clearAll: "Hapus Semua",
        allCaughtUp: "Anda sudah melihat semua!",
        toggleMenu: "Buka/tutup menu navigasi",
        appName: "Inv. Alat Tulis"
    },
    es: {
        dashboard: "Tablero",
        inventory: "Inventario",
        preOrder: "Pre-Orden y Aprobación",
        sparepart: "Aprobación de Repuestos",
        notifications: "Notificaciones",
        clearAll: "Limpiar Todo",
        allCaughtUp: "¡Estás al día!",
        toggleMenu: "Alternar menú de navegación",
        appName: "Inv. de Papelería"
    },
    fr: {
        dashboard: "Tableau de Bord",
        inventory: "Inventaire",
        preOrder: "Pré-Commande & Approbation",
        sparepart: "Approbation des Pièces",
        notifications: "Notifications",
        clearAll: "Tout Effacer",
        allCaughtUp: "Vous êtes à jour !",
        toggleMenu: "Basculer le menu de navigation",
        appName: "Inv. de Papeterie"
    },
    de: {
        dashboard: "Dashboard",
        inventory: "Inventar",
        preOrder: "Vorbestellung & Genehmigung",
        sparepart: "Ersatzteil-Genehmigung",
        notifications: "Benachrichtigungen",
        clearAll: "Alles Löschen",
        allCaughtUp: "Sie sind auf dem neuesten Stand!",
        toggleMenu: "Navigationsmenü umschalten",
        appName: "Schreibwaren-Inv."
    },
    ja: {
        dashboard: "ダッシュボード",
        inventory: "在庫",
        preOrder: "予約注文と承認",
        sparepart: "スペアパーツ承認",
        notifications: "通知",
        clearAll: "すべてクリア",
        allCaughtUp: "すべて確認済みです！",
        toggleMenu: "ナビゲーションメニューの切り替え",
        appName: "文房具在庫"
    },
    ko: {
        dashboard: "대시보드",
        inventory: "인벤토리",
        preOrder: "선주문 및 승인",
        sparepart: "부품 승인",
        notifications: "알림",
        clearAll: "모두 지우기",
        allCaughtUp: "모두 확인했습니다!",
        toggleMenu: "탐색 메뉴 토글",
        appName: "문구 인벤토리"
    },
    'zh-CN': {
        dashboard: "仪表板",
        inventory: "库存",
        preOrder: "预购与审批",
        sparepart: "备件批准",
        notifications: "通知",
        clearAll: "全部清除",
        allCaughtUp: "您已处理所有通知！",
        toggleMenu: "切换导航菜单",
        appName: "文具库存"
    }
};

function NotificationBell() {
  const { notifications, clearNotifications } = useNotifications();
  const { language } = useTheme();
  const t = translations[language] || translations.en;
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
            <h3 className="font-medium">{t.notifications}</h3>
            {hasNotifications && (
              <Button variant="ghost" size="sm" onClick={clearNotifications}>
                <Trash2 className="mr-2 h-4 w-4" />
                {t.clearAll}
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
                      {t.allCaughtUp}
                  </div>
              )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}


export function AppHeader() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { user } = useAuth();
  const { language } = useTheme();
  const t = translations[language] || translations.en;

  const navItems = React.useMemo(() => [
    { href: "/", label: t.dashboard, icon: LayoutDashboard },
    { href: "/inventory", label: t.inventory, icon: Boxes },
    { href: "/pre-orders", label: t.preOrder, icon: ShoppingCart },
    { href: "/approval-sparepart", label: t.sparepart, icon: Wrench },
  ], [t]);

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
  }, [user, navItems]);


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
    <header className="header sticky top-0 z-30 flex h-16 items-center border-b px-4 md:px-6 print:hidden">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <Image src="/favicon.ico?v=8" alt="Logo" width={40} height={40} className="h-10 w-10" />
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
                    <span className="sr-only">{t.toggleMenu}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <div className="flex flex-col gap-6 pt-8">
                    <Link href="/" className="flex items-center gap-2 font-semibold text-lg px-2" onClick={() => setIsMobileMenuOpen(false)}>
                       <Image src="/favicon.ico?v=8" alt="Logo" width={32} height={32} className="h-8 w-8" />
                      <span>{t.appName}</span>
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

    