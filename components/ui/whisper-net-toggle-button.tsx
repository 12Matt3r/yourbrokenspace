
'use client';

import { useWhisperNet } from '@/contexts/WhisperNetContext';
import { Button } from '@/components/ui/button';
import { Waves, X } from 'lucide-react'; // Using Waves as a placeholder icon

export function WhisperNetToggleButton() {
  const { isOverlayOpen, toggleOverlay } = useWhisperNet();

  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed bottom-20 left-6 z-[100] rounded-full h-12 w-12 shadow-lg bg-background/80 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground"
      onClick={toggleOverlay}
      aria-label={isOverlayOpen ? 'Dismiss WhisperNet Overlay' : 'Summon WhisperNet Overlay'}
    >
      {isOverlayOpen ? <X className="h-6 w-6" /> : <Waves className="h-6 w-6" />}
    </Button>
  );
}
