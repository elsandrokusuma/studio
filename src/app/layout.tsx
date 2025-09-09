
import * as React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppHeader } from '@/components/app-header';
import { ThemeProvider } from '@/components/theme-provider';

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
    <ThemeProvider>
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow p-4 md:p-8">
          <div className="mx-auto w-full max-w-full">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
