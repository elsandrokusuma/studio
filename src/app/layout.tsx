
import * as React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppHeader } from '@/components/app-header';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/hooks/use-auth';
import { NotificationProvider } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Stationery Inventory',
  description: 'Comprehensive inventory and stock management ERP',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Stationery Inventory</title>
        <meta name="description" content="Comprehensive inventory and stock management ERP" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        
        {/* Favicon links for different devices with cache-busting */}
        <link rel="icon" href="/favicon.ico?v=3" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.ico?v=3" />
        <link rel="manifest" href="/site.webmanifest" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("no-scrollbar")}>
        <ThemeProvider>
          <NotificationProvider>
            <AuthProvider>
              <div className="flex flex-col min-h-screen">
                <AppHeader />
                <main className="flex-grow p-4 md:p-8">
                  <div className="mx-auto w-full max-w-full">
                    {children}
                  </div>
                </main>
              </div>
              <Toaster />
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
