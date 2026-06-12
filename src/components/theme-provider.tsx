'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type DashboardTheme = 'dark' | 'light';

export const PORTFOLIO_THEMES = [
  { id: 'cyberpunk', name: 'Cyberpunk', description: 'Neon pink & yellow text on deep dark grids', dark: true },
  { id: 'neon-blue', name: 'Neon Blue', description: 'Glow text, dark tech, cyan & teal accents', dark: true },
  { id: 'purple-glow', name: 'Purple Glow', description: 'Violet gradient meshes, rich card blurs', dark: true },
  { id: 'futuristic-ui', name: 'Futuristic UI', description: 'Sci-fi UI grids, tactical green details', dark: true },
  { id: 'minimal', name: 'Minimal', description: 'Ultra-thin borders, wide margins, clean slate', dark: true },
  { id: 'clean-white', name: 'Clean White', description: 'Airy layout, light slate, soft shadows', dark: false },
  { id: 'elegant-typography', name: 'Elegant Typography', description: 'Serif headings, high contrast editorial style', dark: false },
  { id: 'developer-dark', name: 'Developer Dark', description: 'Classic code editor gray with syntax colors', dark: true },
  { id: 'github-style', name: 'GitHub Style', description: 'Familiar clean code look with green commits', dark: true },
  { id: 'dark-code', name: 'Dark Code Theme', description: 'Vibrant syntax tags, Monokai console vibes', dark: true },
  { id: 'ai-futurism', name: 'AI Futurism', description: 'Deep tech, digital matrix, digital data glows', dark: true },
  { id: 'animated-gradients', name: 'Animated Gradients', description: 'Slow shifting mesh colors with glass overlays', dark: true },
];

interface ThemeContextType {
  theme: DashboardTheme;
  toggleTheme: () => void;
  activePortfolioTheme: string;
  setPortfolioTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<DashboardTheme>('dark');
  const [activePortfolioTheme, setPortfolioThemeState] = useState<string>('futuristic-ui');

  useEffect(() => {
    // Load persisted dashboard theme
    const storedTheme = localStorage.getItem('proofforge_theme') as DashboardTheme;
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.setAttribute('data-theme', storedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Load persisted portfolio theme
    const storedPortTheme = localStorage.getItem('proofforge_portfolio_theme');
    if (storedPortTheme) {
      setPortfolioThemeState(storedPortTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('proofforge_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const setPortfolioTheme = (themeId: string) => {
    setPortfolioThemeState(themeId);
    localStorage.setItem('proofforge_portfolio_theme', themeId);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, activePortfolioTheme, setPortfolioTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
