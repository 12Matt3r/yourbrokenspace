
'use client';

import { useWhisperNet } from '@/contexts/WhisperNetContext';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { WhisperNetContent } from './WhisperNetContent';

export function WhisperNetOverlay() {
  const { isOverlayOpen, closeOverlay } = useWhisperNet();

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeOverlay();
      }
    };

    if (isOverlayOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = ''; // Ensure overflow is reset on unmount
    };
  }, [isOverlayOpen, closeOverlay]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[90] bg-background/90 backdrop-blur-md transition-opacity duration-500 ease-in-out',
        isOverlayOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
    >
      {isOverlayOpen && (
        <div className="w-full h-full flex items-center justify-center" onClick={(e) => {
            // Close if clicking on the overlay itself, not its children
            if (e.target === e.currentTarget) {
              closeOverlay();
            }
          }}>
          <WhisperNetContent />
        </div>
      )}
    </div>
  );
}
