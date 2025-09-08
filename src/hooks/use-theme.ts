
'use client';

import * as React from 'react';

type Theme = 'light' | 'dark';
type Color = 'green' | 'blue' | 'orange' | 'rose' | 'violet';
type BackgroundPattern = 'solid' | 'dots' | 'lines' | 'geometric';


type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  color: Color;
  setColor: (color: Color) => void;
  background: BackgroundPattern;
  setBackground: (background: BackgroundPattern) => void;
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
export type { Theme, Color, BackgroundPattern };
