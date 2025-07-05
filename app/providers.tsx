
'use client';

import type { ReactNode } from 'react';
import { MentorAIProvider } from '@/contexts/MentorAIContext';
import { WhisperNetProvider } from '@/contexts/WhisperNetContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { UserProvider } from '@/contexts/UserContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <ThemeProvider>
        <MentorAIProvider>
          <WhisperNetProvider>{children}</WhisperNetProvider>
        </MentorAIProvider>
      </ThemeProvider>
    </UserProvider>
  );
}
