import { WalkthroughPlayer } from '@/components/feature/walkthrough/WalkthroughPlayer';
import { PageWrapper } from '@/components/PageWrapper';
import { Tv2 } from 'lucide-react';

export default function WalkthroughPage() {
  return (
    <PageWrapper className="py-8 md:py-12 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] bg-gradient-to-br from-background via-muted/70 to-background dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="text-center mb-8 md:mb-12">
        <Tv2 className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground">
          YourSpace Guided Tour
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
          Experience the core features of YourSpace. Navigate through interactive channels to see how you can create, connect, and thrive.
        </p>
      </div>
      <div className="w-full max-w-5xl shadow-2xl rounded-lg overflow-hidden border border-border dark:border-slate-700">
        <WalkthroughPlayer />
      </div>
    </PageWrapper>
  );
}
