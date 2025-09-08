
'use client';

import * as React from 'react';

type Theme = 'light' | 'dark';
type Color = 'green' | 'blue' | 'orange' | 'rose' | 'violet';
// Wallpaper can be a URL string or a data URI string from a file upload
type Wallpaper = string;


type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  color: Color;
  setColor: (color: Color) => void;
  wallpaper: Wallpaper;
  setWallpaper: (wallpaper: Wallpaper) => void;
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
export type { Theme, Color, Wallpaper };
