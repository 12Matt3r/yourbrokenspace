
'use client';

import { useMentorAI } from '@/contexts/MentorAIContext';
import { Button } from '@/components/ui/button';
import { BrainCircuit, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MentorAIButton() {
  const { isMentorAIOpen, toggleMentorAI, openMentorAI } = useMentorAI();

  // This button's visibility could be tied to !isMentorAIOpen
  // or it could transform if the drawer is open.
  // For now, let's make it a simple toggle that might be visually hidden when drawer is open,
  // or it serves as the primary way to open it if the bottom tab is not used for this.
  // The prompt implies it's a bubble that reopens the drawer.

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "fixed bottom-20 right-6 z-[100] rounded-full h-12 w-12 shadow-lg bg-accent/80 hover:bg-accent text-accent-foreground backdrop-blur-sm",
        // Hide if overlay is open, or it can be the X button to close
        // isMentorAIOpen ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
        // For now, let's assume this is the main toggle when the drawer is closed.
      )}
      onClick={toggleMentorAI}
      aria-label={isMentorAIOpen ? 'Close Mentor AI' : 'Open Mentor AI'}
    >
      {isMentorAIOpen ? <X className="h-6 w-6" /> : <BrainCircuit className="h-6 w-6" />}
    </Button>
  );
}
