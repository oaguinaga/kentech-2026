import { useEffect, useState } from 'react';

/**
 * Hook to manage dark mode state
 * Uses data-theme attribute on html element
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) {
        return stored === 'dark';
      }
      // Fallback to system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);


  const toggle = () => {
    setIsDark((prev) => !prev);
  };

  const setDark = (dark: boolean) => {
    setIsDark(dark);
  };

  return {
    isDark,
    toggle,
    setDark,
  };
}

