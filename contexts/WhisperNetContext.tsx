
'use client';

import type { ReactNode } from 'react';
import { createContext, useState, useCallback, useContext } from 'react';

interface WhisperNetContextType {
  isOverlayOpen: boolean;
  toggleOverlay: () => void;
  openOverlay: () => void;
  closeOverlay: () => void;
}

const WhisperNetContext = createContext<WhisperNetContextType | undefined>(undefined);

export function WhisperNetProvider({ children }: { children: ReactNode }) {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const toggleOverlay = useCallback(() => {
    setIsOverlayOpen(prev => !prev);
  }, []);

  const openOverlay = useCallback(() => {
    setIsOverlayOpen(true);
  }, []);

  const closeOverlay = useCallback(() => {
    setIsOverlayOpen(false);
  }, []);

  return (
    <WhisperNetContext.Provider value={{ isOverlayOpen, toggleOverlay, openOverlay, closeOverlay }}>
      {children}
    </WhisperNetContext.Provider>
  );
}

export function useWhisperNet() {
  const context = useContext(WhisperNetContext);
  if (context === undefined) {
    throw new Error('useWhisperNet must be used within a WhisperNetProvider');
  }
  return context;
}
