'use client';

import { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import type { ThemeId, ThemeSpec } from '@/lib/theme/types';
import { applyThemeToDOM } from '@/lib/theme/dom';

type ThemeCtx = {
  activeId: ThemeId;
  registry: Record<string, ThemeSpec>;
  setTheme: (t: ThemeId | ThemeSpec) => void;
  upsertCustomTheme: (t: ThemeSpec) => void;
  removeCustomTheme: (id: ThemeId) => void;
};

const ThemeContext = createContext<ThemeCtx | undefined>(undefined);

const LS_REGISTRY_KEY = 'yourspace-theme-registry';
const LS_ACTIVE_ID_KEY = 'yourspace-theme-id';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [registry, setRegistry] = useState<Record<string, ThemeSpec>>({});
  const [activeId, setActiveId] = useState<ThemeId>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedRegistry = localStorage.getItem(LS_REGISTRY_KEY);
      if (storedRegistry) {
        setRegistry(JSON.parse(storedRegistry));
      }
      const storedActiveId = localStorage.getItem(LS_ACTIVE_ID_KEY) as ThemeId | null;
      if (storedActiveId) {
        setActiveId(storedActiveId);
      }
    } catch (e) {
      console.error("Failed to load theme from localStorage", e);
    }
    setIsLoaded(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(LS_REGISTRY_KEY, JSON.stringify(registry));
      localStorage.setItem(LS_ACTIVE_ID_KEY, activeId);
    }
  }, [registry, activeId, isLoaded]);

  // Apply theme to DOM
  useEffect(() => {
    if (isLoaded) {
      applyThemeToDOM(activeId, registry);
    }
  }, [activeId, registry, isLoaded]);

  const setTheme = useCallback((t: ThemeId | ThemeSpec) => {
    const newId = typeof t === 'string' ? t : t.id;
    setActiveId(newId);
    if (typeof t !== 'string') {
      setRegistry(prev => ({ ...prev, [newId]: t }));
    }
  }, []);

  const upsertCustomTheme = useCallback((t: ThemeSpec) => {
    if (!t.id.startsWith('custom:')) return;
    setRegistry(prev => ({ ...prev, [t.id]: t }));
  }, []);

  const removeCustomTheme = useCallback((id: ThemeId) => {
    if (!id.startsWith('custom:')) return;
    setRegistry(prev => {
      const newRegistry = { ...prev };
      delete newRegistry[id];
      return newRegistry;
    });
    // If the active theme was the one removed, fall back to default.
    if (activeId === id) {
      setActiveId('dark');
    }
  }, [activeId]);

  const value: ThemeCtx = {
    activeId,
    registry,
    setTheme,
    upsertCustomTheme,
    removeCustomTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
