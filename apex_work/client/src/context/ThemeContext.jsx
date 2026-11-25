import React, { createContext, useContext, useEffect, useState } from 'react';
const ThemeContext = createContext(null);
export function ThemeProvider({children}) {
  const [theme,setTheme] = useState(() => {
    try { return localStorage.getItem('apex-theme') || 'system'; } catch { return 'system'; }
  });
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'system' && media.matches));
    update(); media.addEventListener('change', update);
    try { localStorage.setItem('apex-theme',theme); } catch {}
    return () => media.removeEventListener('change', update);
  },[theme]);
  return <ThemeContext.Provider value={{theme,setTheme}}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);
