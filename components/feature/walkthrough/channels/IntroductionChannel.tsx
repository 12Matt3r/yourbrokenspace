
import Image from 'next/image';
import { YourSpaceLogo } from '@/components/branding/YourSpaceLogo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function IntroductionChannel() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 dark:from-slate-900 dark:via-slate-800 dark:to-accent/20">
      <Image
        src="https://placehold.co/600x400.png"
        alt="Surreal creative background"
        layout="fill"
        objectFit="cover"
        className="opacity-20 dark:opacity-10"
        data-ai-hint="surreal creative background"
        priority
      />
      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <div className="mb-8 flex justify-center">
          <YourSpaceLogo />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold font-headline mb-6 text-foreground drop-shadow-md">
          Welcome to YourSpace
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-4 leading-relaxed">
          Step into a realm where creativity knows no bounds. YourSpace is an interactive sanctuary designed for artists, musicians, writers, developers, and innovators of all kinds.
        </p>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
          Our vision is to empower you to <strong className="text-primary">showcase</strong> your unique talents, <strong className="text-accent">monetize</strong> your passion, and <strong className="text-secondary-foreground dark:text-secondary">collaborate</strong> within a vibrant, supportive community. This is more than a platform; it's your interactive creative lab.
        </p>
        
        <Card className="bg-card/70 backdrop-blur-md shadow-xl dark:bg-slate-800/70">
            <CardHeader>
                <CardTitle className="text-2xl text-primary">Our Core Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-left space-y-3 text-foreground/90">
                <p><strong>Inspire Creation:</strong> Provide tools and spaces that ignite imagination and facilitate artistic expression in all its forms.</p>
                <p><strong>Foster Community:</strong> Build a connected network where creators can find support, feedback, and collaborative partners.</p>
                <p><strong>Empower Growth:</strong> Offer pathways for learning, skill development, and achieving creative and financial independence.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
