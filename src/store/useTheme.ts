import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'istaa-theme';

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

let currentTheme = getInitialTheme();
applyTheme(currentTheme);

const listeners = new Set<(theme: Theme) => void>();

function setTheme(theme: Theme) {
  currentTheme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
  listeners.forEach(listener => listener(theme));
}

export function useTheme() {
  const [theme, setLocalTheme] = useState<Theme>(currentTheme);

  useEffect(() => {
    listeners.add(setLocalTheme);
    return () => { listeners.delete(setLocalTheme); };
  }, []);

  const toggleTheme = () => setTheme(currentTheme === 'dark' ? 'light' : 'dark');

  return { theme, setTheme, toggleTheme };
}
