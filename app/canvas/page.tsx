
import { CollaborativeCanvas } from '@/components/feature/canvas/CollaborativeCanvas';
import { PageWrapper } from '@/components/PageWrapper';
import { Brush } from 'lucide-react';

export default function CanvasPage() {
  return (
    <PageWrapper className="py-8 md:py-12 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] bg-gradient-to-br from-muted/30 to-background dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center mb-8">
            <Brush className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground">
            Real-Time Canvas
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
            Sketch out ideas, brainstorm with your team, or just doodle. A shared space for visual collaboration.
            </p>
        </div>
        <div className="w-full max-w-7xl shadow-2xl rounded-lg overflow-hidden border border-border dark:border-slate-700">
            <CollaborativeCanvas />
        </div>
    </PageWrapper>
  );
}
