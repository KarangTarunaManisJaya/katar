import React, { createContext, useContext, useState, useEffect } from 'react';

export type DisplayMode = 'light' | 'dark' | 'system';
export type SidebarState = 'expanded' | 'collapsed';
export type SidebarPosition = 'kiri' | 'kanan';
export type SidebarWidth = 'kecil' | 'standar' | 'lebar';
export type SidebarColor = 'dark_navy' | 'black_slate' | 'karang_taruna_blue' | 'light_white' | 'deep_indigo';
export type ActiveMenuHighlight = 'pill_blue' | 'border_left' | 'glow_indigo' | 'soft_badge' | 'gradient_karang_taruna';
export type MobileSidebarMode = 'drawer' | 'bottom_bar' | 'floating_menu';
export type MobileTableSize = 'card' | 'scroll' | 'compact';

export interface ThemeSettings {
  // 1. Tema Aplikasi
  displayMode: DisplayMode;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;

  // 2. Sidebar / Menu
  sidebarState: SidebarState;
  sidebarPosition: SidebarPosition;
  sidebarWidth: SidebarWidth;
  showMenuIcon: boolean;
  showMenuText: boolean;
  autoCollapse: boolean;
  sidebarColor: SidebarColor;
  activeMenuHighlight: ActiveMenuHighlight;

  // 3. Responsif (Mobile)
  mobileSidebarMode: MobileSidebarMode;
  mobileTableSize: MobileTableSize;
}

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  displayMode: 'light',
  primaryColor: '#2563eb', // Blue 600
  secondaryColor: '#0f2744', // Dark Navy
  accentColor: '#38bdf8', // Sky 400
  backgroundColor: '#f8fafc', // Slate 50

  sidebarState: 'expanded',
  sidebarPosition: 'kiri',
  sidebarWidth: 'standar',
  showMenuIcon: true,
  showMenuText: true,
  autoCollapse: false,
  sidebarColor: 'dark_navy',
  activeMenuHighlight: 'pill_blue',

  mobileSidebarMode: 'drawer',
  mobileTableSize: 'scroll',
};

interface ThemeContextType {
  theme: ThemeSettings;
  updateTheme: (newTheme: Partial<ThemeSettings>) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_THEME_SETTINGS,
  updateTheme: () => {},
  resetTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeSettings>(() => {
    try {
      const saved = localStorage.getItem('kt_theme_settings_v1');
      if (saved) {
        return { ...DEFAULT_THEME_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {}
    return DEFAULT_THEME_SETTINGS;
  });

  const updateTheme = (newSettings: Partial<ThemeSettings>) => {
    setTheme((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('kt_theme_settings_v1', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const resetTheme = () => {
    setTheme(DEFAULT_THEME_SETTINGS);
    try {
      localStorage.setItem('kt_theme_settings_v1', JSON.stringify(DEFAULT_THEME_SETTINGS));
    } catch (e) {}
  };

  useEffect(() => {
    // Apply dark class to document body if dark mode or system dark
    const root = document.documentElement;
    if (theme.displayMode === 'dark') {
      root.classList.add('dark');
    } else if (theme.displayMode === 'light') {
      root.classList.remove('dark');
    } else if (theme.displayMode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme.displayMode]);

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
