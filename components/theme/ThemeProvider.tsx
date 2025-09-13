'use client';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ThemeContextValue = {
  theme: Theme;                 // user preference
  resolvedTheme: 'light' | 'dark'; // after system resolution
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystem(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children, defaultTheme = 'system' as Theme }: { children: React.ReactNode; defaultTheme?: Theme; }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme;
    return (localStorage.getItem('theme') as Theme) || defaultTheme;
  });

  const resolvedTheme = useMemo(() => (theme === 'system' ? getSystem() : theme), [theme]);

  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute('data-theme', resolvedTheme);
    try { localStorage.setItem('theme', theme); } catch {}
    if (theme === 'system') {
      const m = window.matchMedia('(prefers-color-scheme: dark)');
      const onChange = () => el.setAttribute('data-theme', getSystem());
      m.addEventListener('change', onChange);
      return () => m.removeEventListener('change', onChange);
    }
  }, [theme, resolvedTheme]);

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

/**
 * Inline, SSR-safe script to avoid theme flash on first paint.
 * Place this in the HTML <head> (e.g., Next.js app/layout.tsx).
 */
export function ThemeScript() {
  const code = `
(function(){
  try {
    var t = localStorage.getItem('theme') || 'system';
    var d = (t === 'dark') || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme', d ? 'dark' : 'light');
  } catch(e) {}
})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
