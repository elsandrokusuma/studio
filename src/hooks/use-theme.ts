
'use client';

import * as React from 'react';

type Theme = 'light' | 'dark';
type Color = 'green' | 'blue' | 'orange' | 'rose' | 'violet';
// Wallpaper can be a URL, a hex code, or 'default'
type Wallpaper = string;
type Language = 'id' | 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'zh-CN';


type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  color: Color;
  setColor: (color: Color) => void;
  wallpaper: Wallpaper;
  setWallpaper: (wallpaper: Wallpaper) => void;
  wallpaperOpacity: number;
  setWallpaperOpacity: (opacity: number) => void;
  componentOpacity: number;
  setComponentOpacity: (opacity: number) => void;
  language: Language;
  setLanguage: (language: Language) => void;
};

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { ThemeContext };
export type { Theme, Color, Wallpaper, Language };
