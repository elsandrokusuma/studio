
'use client';

import * as React from 'react';
import type { Metadata } from 'next';
import Cookies from 'js-cookie';
import Image from 'next/image';

import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { AppHeader } from '@/components/app-header';
import { ThemeContext, type Theme, type Color, type Wallpaper } from '@/hooks/use-theme';

// We can't export this from the layout, so we define it here.
// Still, to get the metadata to work, we'll need to define it statically.
// export const metadata: Metadata = {
//   title: 'Stationery Inventory',
//   description: 'Comprehensive inventory and stock management ERP',
// };

function AppWallpaper() {
    const { wallpaper } = React.useContext(ThemeContext)!;
    const [imageUrl, setImageUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
        // Handle both default URLs and locally stored data URIs
        if (wallpaper && wallpaper.startsWith('data:image')) {
            setImageUrl(wallpaper);
        } else if (wallpaper) {
            // For default wallpapers, it's a direct URL
            setImageUrl(wallpaper);
        } else {
            setImageUrl(null);
        }
    }, [wallpaper]);

    if (!imageUrl) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden">
            <Image
                src={imageUrl}
                alt="Background Wallpaper"
                fill
                className="object-cover"
                unoptimized // Use this if the source can be a data URI
            />
            <div className="absolute inset-0 bg-black/30 dark:bg-black/50" />
        </div>
    );
}


function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>('light');
  const [color, setColorState] = React.useState<Color>('green');
  const [wallpaper, setWallpaperState] = React.useState<Wallpaper>('default');
  
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    const savedTheme = Cookies.get('theme') as Theme | undefined;
    const savedColor = Cookies.get('color') as Color | undefined;
    const savedWallpaper = localStorage.getItem('wallpaper') as Wallpaper | undefined;

    if (savedTheme) setThemeState(savedTheme);
    if (savedColor) setColorState(savedColor);
    if (savedWallpaper) setWallpaperState(savedWallpaper);
    
    setIsMounted(true);
  }, []);
  
  // Only render children when mounted to avoid hydration mismatch
  if (!isMounted) {
    // Return a placeholder or null to prevent server-client mismatch
    return null; 
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    Cookies.set('theme', newTheme, { expires: 365 });
  };

  const setColor = (newColor: Color) => {
    setColorState(newColor);
    Cookies.set('color', newColor, { expires: 365 });
  };
  
  const setWallpaper = (newWallpaper: Wallpaper) => {
    setWallpaperState(newWallpaper);
    // Use localStorage for wallpaper as it can store larger data (e.g., data URIs)
    localStorage.setItem('wallpaper', newWallpaper);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, color, setColor, wallpaper, setWallpaper }}>
       <html lang="en" suppressHydrationWarning className={cn(theme, `theme-${color}`)}>
          <head>
            <title>Stationery Inventory</title>
            <meta name="description" content="Comprehensive inventory and stock management ERP" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
          </head>
           <body className={cn('font-body antialiased bg-background text-foreground')}>
              <AppWallpaper />
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
