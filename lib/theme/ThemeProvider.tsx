import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getResolvedTheme, persistTheme, setThemeOnDocument, storageKey } from './dom';

type ThemeVars = Record<string, string>;
type Ctx = {
  theme: string;
  setTheme: (name: string) => void;
  addCustomTheme: (name: string, vars: ThemeVars) => void;
  removeCustomTheme: (name: string) => void;
};

const ThemeCtx = createContext<Ctx | null>(null);

type Props = {
  children: React.ReactNode;
  initialTheme?: string;
  attribute?: 'class' | 'data-theme';
};

export const ThemeProvider: React.FC<Props> = ({
  children,
  initialTheme,
  attribute = 'data-theme',
}) => {
  // style tags we inject for custom themes
  const stylesRef = useRef<Map<string, HTMLStyleElement>>(new Map());

  // resolve initial synchronously to avoid flash
  const initial = initialTheme ?? getResolvedTheme();
  const [theme, setThemeState] = useState(initial);

  // apply theme to DOM + persist
  const apply = (name: string) => {
    setThemeOnDocument(name, { attribute });
    persistTheme(name);
  };

  useEffect(() => {
    apply(theme);
  }, [theme, attribute]);

  // Cross-tab storage sync (optional but harmless with our test mock)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey && typeof e.newValue === 'string') {
        setThemeState(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addCustomTheme = (name: string, vars: ThemeVars) => {
    // create or update a style tag scoped to :root[data-theme="name"]
    const selector =
      attribute === 'data-theme'
        ? `:root[data-theme="${name}"]`
        : `:root.theme-${name}`;
    const css = `${selector}{${Object.entries(vars)
      .map(([k, v]) => `${k}:${v};`)
      .join('')}}`;

    let el = stylesRef.current.get(name);
    if (!el) {
      el = document.createElement('style');
      el.setAttribute('data-theme', name);
      document.head.appendChild(el);
      stylesRef.current.set(name, el);
    }
    el.textContent = css;
  };

  const removeCustomTheme = (name: string) => {
    const el = stylesRef.current.get(name);
    if (el) {
      el.parentNode?.removeChild(el);
      stylesRef.current.delete(name);
    }
  };

  const value = useMemo<Ctx>(
    () => ({
      theme,
      setTheme: (n) => setThemeState(n),
      addCustomTheme,
      removeCustomTheme,
    }),
    [theme]
  );

  // Apply once at mount to avoid any mismatch (SSR/CSR)
  useEffect(() => {
    apply(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
};

export const useTheme = (): Ctx => {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
