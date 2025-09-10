import React from 'react';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';

export function withTheme(ui: React.ReactElement, opts?: {initial?: string}) {
  const Wrapper: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <ThemeProvider initialTheme={opts?.initial ?? 'light'}>
      {children}
    </ThemeProvider>
  );
  return { Wrapper };
}
