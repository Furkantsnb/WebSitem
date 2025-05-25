import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // localStorage'dan tema tercihini al
    const savedTheme = localStorage.getItem('theme');
    // Sistem tercihini kontrol et
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    // Önce localStorage, yoksa sistem tercihini kullan
    return savedTheme ? savedTheme === 'dark' : prefersDark;
  });

  useEffect(() => {
    // Tema değiştiğinde HTML elementine class ekle/çıkar
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 