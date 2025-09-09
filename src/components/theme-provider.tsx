
'use client';

import * as React from 'react';
import Cookies from 'js-cookie';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { ThemeContext, type Theme, type Color, type Wallpaper } from '@/hooks/use-theme';

function AppWallpaper() {
    const { wallpaper, wallpaperOpacity } = React.useContext(ThemeContext)!;
    const [imageUrl, setImageUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (wallpaper === 'default') {
            setImageUrl(null);
            return;
        }

        if (wallpaper) {
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
                unoptimized
            />
            <div 
              className="absolute inset-0 bg-black" 
              style={{ opacity: wallpaperOpacity }}
            />
        </div>
    );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>('dark');
  const [color, setColorState] = React.useState<Color>('green');
  const [wallpaper, setWallpaperState] = React.useState<Wallpaper>('default');
  const [wallpaperOpacity, setWallpaperOpacityState] = React.useState(0.5);
  const [componentOpacity, setComponentOpacityState] = React.useState(1);
  
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    const savedTheme = Cookies.get('theme') as Theme | undefined;
    const savedColor = Cookies.get('color') as Color | undefined;
    const savedWallpaper = localStorage.getItem('wallpaper') as Wallpaper | undefined;
    const savedWallpaperOpacity = localStorage.getItem('wallpaperOpacity');
    const savedComponentOpacity = localStorage.getItem('componentOpacity');

    if (savedTheme) setThemeState(savedTheme);
    if (savedColor) setColorState(savedColor);
    if (savedWallpaper) setWallpaperState(savedWallpaper);
    if (savedWallpaperOpacity) setWallpaperOpacityState(parseFloat(savedWallpaperOpacity));
    if (savedComponentOpacity) setComponentOpacityState(parseFloat(savedComponentOpacity));
    
    setIsMounted(true);
  }, []);
  
  React.useEffect(() => {
    if (isMounted) {
      document.documentElement.className = cn(theme, `theme-${color}`);
      document.documentElement.style.setProperty('--wallpaper-overlay-opacity', wallpaperOpacity.toString());
      document.documentElement.style.setProperty('--component-opacity', componentOpacity.toString());
    }
  }, [isMounted, theme, color, wallpaperOpacity, componentOpacity]);

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
    localStorage.setItem('wallpaper', newWallpaper);
  };
  
  const setWallpaperOpacity = (opacity: number) => {
    setWallpaperOpacityState(opacity);
    localStorage.setItem('wallpaperOpacity', opacity.toString());
  };

  const setComponentOpacity = (opacity: number) => {
    setComponentOpacityState(opacity);
    localStorage.setItem('componentOpacity', opacity.toString());
  };

  const contextValue = { 
      theme, setTheme, 
      color, setColor, 
      wallpaper, setWallpaper,
      wallpaperOpacity, setWallpaperOpacity,
      componentOpacity, setComponentOpacity
  };

  if (!isMounted) {
      return null;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
       <AppWallpaper />
       {children}
    </ThemeContext.Provider>
  );
}
