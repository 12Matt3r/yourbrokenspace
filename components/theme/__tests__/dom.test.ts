import { describe, it, expect, beforeEach } from 'vitest';
import {
  setThemeOnDocument,
  getResolvedTheme,
  persistTheme,
  readPersistedTheme,
} from '@/components/theme/dom';

const q = () => document.documentElement;

describe('theme DOM utilities', () => {
  beforeEach(() => {
    // reset DOM & storage
    document.documentElement.className = '';
    // @ts-ignore
    delete document.documentElement.dataset.theme;
    window.localStorage.clear();
  });

  it('sets data-theme attribute by default', () => {
    setThemeOnDocument('dark');
    expect(q().dataset.theme).toBe('dark');
  });

  it('can set theme via class instead of data attribute', () => {
    setThemeOnDocument('light', { attribute: 'class' });
    expect(q().classList.contains('theme-light')).toBe(true);
  });

  it('replaces previous class theme cleanly', () => {
    setThemeOnDocument('light', { attribute: 'class' });
    setThemeOnDocument('solarized', { attribute: 'class' });
    expect(q().classList.contains('theme-light')).toBe(false);
    expect(q().classList.contains('theme-solarized')).toBe(true);
  });

  it('persists and reads theme from localStorage', () => {
    persistTheme('dark');
    expect(readPersistedTheme()).toBe('dark');
  });

  it('resolved theme prefers DOM attribute > storage > system', () => {
    // storage
    persistTheme('light');
    // DOM wins
    setThemeOnDocument('dark');
    // jsdom matchMedia -> matches:false => treat as 'light' if system fallback used
    expect(getResolvedTheme()).toBe('dark');
  });

  it('gracefully handles invalid values', () => {
    // @ts-ignore
    setThemeOnDocument(null);
    expect(q().dataset.theme ?? q().className).not.toContain('null');
  });

  it('resolved theme prefers DOM class > storage', () => {
    persistTheme('dark'); // storage is 'dark'
    setThemeOnDocument('light', { attribute: 'class' }); // DOM is 'light' via class
    expect(getResolvedTheme()).toBe('light');
  });
});
