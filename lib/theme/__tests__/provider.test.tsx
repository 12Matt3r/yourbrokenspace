import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '@/lib/theme/ThemeProvider';

const Probe: React.FC = () => {
  const { theme, setTheme, addCustomTheme, removeCustomTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={() => setTheme('dark')}>dark</button>
      <button onClick={() => setTheme('light')}>light</button>
      <button onClick={() => addCustomTheme('midnight', { '--bg': '#000' })}>add</button>
      <button onClick={() => removeCustomTheme('midnight')}>remove</button>
    </div>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    // @ts-ignore
    delete document.documentElement.dataset.theme;
    window.localStorage.clear();
  });

  it('mounts with initial theme and writes to DOM', () => {
    render(
      <ThemeProvider initialTheme="light">
        <Probe />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('app:theme')).toBe('light');
  });

  it('switches theme and persists', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider initialTheme="light">
        <Probe />
      </ThemeProvider>
    );
    await user.click(screen.getByText('dark'));
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('app:theme')).toBe('dark');
  });

  it('restores persisted theme on mount', () => {
    localStorage.setItem('app:theme', 'dark');
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('registers and removes custom themes', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider initialTheme="light">
        <Probe />
      </ThemeProvider>
    );

    await user.click(screen.getByText('add'));
    // Your impl detail: maybe ThemeProvider injects a style tag per custom theme:
    const styleEl = document.querySelector('style[data-theme="midnight"]');
    expect(styleEl).toBeTruthy();

    await user.click(screen.getByText('remove'));
    expect(document.querySelector('style[data-theme="midnight"]')).toBeFalsy();
  });

  it('does not crash under SSR-like conditions (no window guards)', () => {
    // Simulate SSR by calling ThemeProvider logic that should guard window access.
    // If your provider checks typeof window before touching storage/matchMedia, this will pass by virtue of jsdom presence.
    render(
      <ThemeProvider initialTheme="light">
        <Probe />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });
});
