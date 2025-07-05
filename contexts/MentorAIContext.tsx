
'use client';

import type { ReactNode } from 'react';
import { createContext, useState, useCallback, useContext } from 'react';

interface MentorAIContextType {
  isMentorAIOpen: boolean;
  toggleMentorAI: () => void;
  openMentorAI: () => void;
  closeMentorAI: () => void;
}

const MentorAIContext = createContext<MentorAIContextType | undefined>(undefined);

export function MentorAIProvider({ children }: { children: ReactNode }) {
  const [isMentorAIOpen, setIsMentorAIOpen] = useState(false);

  const toggleMentorAI = useCallback(() => {
    setIsMentorAIOpen(prev => !prev);
  }, []);

  const openMentorAI = useCallback(() => {
    setIsMentorAIOpen(true);
  }, []);

  const closeMentorAI = useCallback(() => {
    setIsMentorAIOpen(false);
  }, []);

  return (
    <MentorAIContext.Provider value={{ isMentorAIOpen, toggleMentorAI, openMentorAI, closeMentorAI }}>
      {children}
    </MentorAIContext.Provider>
  );
}

export function useMentorAI() {
  const context = useContext(MentorAIContext);
  if (context === undefined) {
    throw new Error('useMentorAI must be used within a MentorAIProvider');
  }
  return context;
}
