
'use client';

import * as React from 'react';
import type { Metadata } from 'next';
import Cookies from 'js-cookie';

import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { AppHeader } from '@/components/app-header';
import { ThemeContext, type Theme, type Color, type BackgroundPattern } from '@/hooks/use-theme';

// We can't export this from the layout, so we define it here.
// Still, to get the metadata to work, we'll need to define it statically.
// export const metadata: Metadata = {
//   title: 'Stationery Inventory',
//   description: 'Comprehensive inventory and stock management ERP',
// };

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>('light');
  const [color, setColorState] = React.useState<Color>('green');
  const [background, setBackgroundState] = React.useState<BackgroundPattern>('solid');
  
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    const savedTheme = Cookies.get('theme') as Theme | undefined;
    const savedColor = Cookies.get('color') as Color | undefined;
    const savedBackground = Cookies.get('background') as BackgroundPattern | undefined;

    if (savedTheme) {
      setThemeState(savedTheme);
    }
    if (savedColor) {
      setColorState(savedColor);
    }
     if (savedBackground) {
      setBackgroundState(savedBackground);
    }
    setIsMounted(true);
  }, []);
  
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    Cookies.set('theme', newTheme, { expires: 365 });
  };

  const setColor = (newColor: Color) => {
    setColorState(newColor);
    Cookies.set('color', newColor, { expires: 365 });
  };
  
  const setBackground = (newBackground: BackgroundPattern) => {
    setBackgroundState(newBackground);
    Cookies.set('background', newBackground, { expires: 365 });
  };

  const layoutClasses = isMounted ? cn(theme, `theme-${color}`, `bg-pattern-${background}`) : '';

  return (
    <ThemeContext.Provider value={{ theme, setTheme, color, setColor, background, setBackground }}>
       <html lang="en" suppressHydrationWarning className={layoutClasses}>
          <head>
            <title>Stationery Inventory</title>
            <meta name="description" content="Comprehensive inventory and stock management ERP" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
          </head>
           <body className={cn('font-body antialiased bg-background text-foreground')}>
              {children}
           </body>
       </html>
    </ThemeContext.Provider>
  );
}


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
