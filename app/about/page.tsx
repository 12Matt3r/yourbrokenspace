
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PageWrapper } from '@/components/PageWrapper';
import { Info, ArrowLeft, Palette, Users, Sparkles, DollarSign, Server } from 'lucide-react';

export default function AboutPage() {
  return (
    <PageWrapper className="py-12">
      <Card className="max-w-3xl mx-auto shadow-lg border-border">
        <CardHeader className="text-center border-b pb-6">
          <Palette className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-4xl font-bold font-headline text-foreground">About YourSpace</CardTitle>
          <p className="text-lg text-muted-foreground mt-2">Interactive Creative Labs & Digital Ecosystem</p>
        </CardHeader>
        <CardContent className="pt-8 space-y-8 text-lg text-muted-foreground">
          <p className="text-center text-xl leading-relaxed">
            Welcome to <strong>YourSpace</strong>, a dynamic digital ecosystem meticulously designed for artists and creators across all disciplines—musicians, visual artists, filmmakers, game developers, writers, and beyond. Our platform empowers you to <strong className="text-primary">create</strong>, <strong className="text-accent">collaborate</strong>, and <strong>monetize</strong> your unique work.
          </p>
          
          <div className="border-t pt-8">
            <h2 className="text-2xl font-semibold text-center mb-8 text-foreground font-headline">Our Core Pillars</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="flex flex-col items-center text-center p-6 bg-card/50 rounded-lg shadow-md border">
                <Server className="h-12 w-12 text-primary mb-3" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Personalized Sanctuaries</h3>
                <p className="text-base text-muted-foreground">
                  Every creator begins with a customizable virtual space—your digital studio, gallery, and stage, all in one.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6 bg-card/50 rounded-lg shadow-md border">
                <Users className="h-12 w-12 text-primary mb-3" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Vibrant Community</h3>
                <p className="text-base text-muted-foreground">
                  Connect in interactive common areas, join virtual events, and find collaborators to bring ambitious projects to life.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 bg-card/50 rounded-lg shadow-md border">
                <Sparkles className="h-12 w-12 text-primary mb-3" />
                <h3 className="text-xl font-semibold text-foreground mb-2">AI-Driven Growth</h3>
                <p className="text-base text-muted-foreground">
                  Leverage AI for personalized insights, content tagging, collaboration suggestions, and skill development pathways.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6 bg-card/50 rounded-lg shadow-md border">
                <DollarSign className="h-12 w-12 text-primary mb-3" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Fair Monetization</h3>
                <p className="text-base text-muted-foreground">
                  An ad-free, subscription-based model with transparent revenue sharing and tools for fan investment in your work.
                </p>
              </div>
            </div>
          </div>
          
          <p className="pt-6 text-center text-lg">
            YourSpace is committed to fostering an inclusive environment where your imagination can flourish and your creative endeavors are celebrated and rewarded.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center pt-8 border-t">
          <Link href="/">
            <Button variant="outline" size="lg" className="text-base">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </PageWrapper>
  );
}
