import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('dark');

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('pitchboss_theme', mode);
  };

  const toggleTheme = () => {
    // Keep executive dark mode as requested
    setTheme('dark');
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light-theme');
    root.classList.add('dark');
    localStorage.setItem('pitchboss_theme', 'dark');
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
