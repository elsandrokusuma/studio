
'use client';

import * as React from 'react';
import Cookies from 'js-cookie';

type Theme = 'light' | 'dark';
type Color = 'green' | 'blue' | 'orange' | 'red' | 'purple';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  color: Color;
  setColor: (color: Color) => void;
};

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export const colorThemes: Record<Color, string> = {
  green: '142 71% 45%',
  blue: '221 83% 53%',
  orange: '25 95% 53%',
  red: '0 84% 60%',
  purple: '262 83% 58%',
};

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { ThemeContext };
export type { Theme, Color };
