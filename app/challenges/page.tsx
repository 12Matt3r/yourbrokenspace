'use client';

import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { type Challenge } from '@/config/challengeData';
import { Award, Calendar, ChevronRight, Gavel, ListChecks, Brush, Code, Music, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAllChallenges } from '@/lib/firebase/firestoreService';

function ChallengeIcon({ iconName }: { iconName: Challenge['icon'] }) {
    switch (iconName) {
        case 'Brush':
            return <Brush className="h-8 w-8 text-primary" />;
        case 'Code':
            return <Code className="h-8 w-8 text-green-500" />;
        case 'Music':
            return <Music className="h-8 w-8 text-blue-500" />;
        default:
            return <Award className="h-8 w-8 text-primary" />;
    }
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const isActive = challenge.status === 'active';
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow bg-card/80 flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <ChallengeIcon iconName={challenge.icon} />
            <CardTitle className="text-2xl font-headline mt-2">{challenge.title}</CardTitle>
          </div>
          <Badge variant={isActive ? 'default' : 'secondary'} className="capitalize">{challenge.status}</Badge>
        </div>
        <CardDescription>{challenge.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        <div>
          <h4 className="font-semibold flex items-center mb-2"><Award className="mr-2 h-4 w-4 text-primary" /> Prize</h4>
          <p className="text-sm text-muted-foreground">{challenge.prize}</p>
        </div>
        <div>
          <h4 className="font-semibold flex items-center mb-2"><ListChecks className="mr-2 h-4 w-4 text-primary" /> Rules</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            {challenge.rules.map((rule, index) => <li key={index}>{rule}</li>)}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-4 mt-auto">
        <div className="text-sm text-muted-foreground flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{isActive ? `Deadline: ${challenge.deadline}` : `Ended: ${challenge.deadline}`}</span>
        </div>
        {isActive ? (
          <Link href={`/explore?tag=${challenge.submissionTag}`}>
            <Button>
              Participate <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : (
           <Link href={`/explore?tag=${challenge.submissionTag}`}>
             <Button variant="outline">View Submissions</Button>
           </Link>
        )}
      </CardFooter>
    </Card>
  );
}

export default function ChallengesPage() {
    const { toast } = useToast();
    const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchChallenges = async () => {
            setIsLoading(true);
            try {
                const firestoreChallenges = await getAllChallenges();
                if (firestoreChallenges.length === 0) {
                     toast({
                        title: 'No Challenges Found',
                        description: 'The community challenges collection appears to be empty.',
                        variant: 'destructive',
                    });
                }
                setAllChallenges(firestoreChallenges);
            } catch(error) {
                console.error("Failed to fetch challenges:", error);
                toast({
                    variant: 'destructive',
                    title: 'Failed to load challenges',
                    description: 'Could not retrieve challenges from the database.'
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchChallenges();
    }, [toast]);

    const activeChallenges = allChallenges.filter(c => c.status === 'active');
    const pastChallenges = allChallenges.filter(c => c.status === 'past');

    if (isLoading) {
        return (
             <PageWrapper className="py-12 flex justify-center items-center min-h-[calc(100vh-10rem)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
             </PageWrapper>
        )
    }

    return (
        <PageWrapper className="py-12">
            <header className="mb-12 text-center">
                <Gavel className="h-16 w-16 text-primary mx-auto mb-4" />
                <h1 className="text-5xl font-bold font-headline text-foreground">Community Challenges</h1>
                <p className="text-xl text-muted-foreground mt-2">
                    Test your skills, find inspiration, and win exclusive rewards.
                </p>
            </header>

            <div className="space-y-12">
                <section>
                    <h2 className="text-3xl font-bold font-headline mb-6">Active Challenges</h2>
                    {activeChallenges.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {activeChallenges.map(challenge => <ChallengeCard key={challenge.id} challenge={challenge} />)}
                        </div>
                    ) : (
                        <Card className="text-center p-8 bg-muted/50 border-dashed">
                            <p className="text-muted-foreground">No active challenges right now. Check back soon!</p>
                        </Card>
                    )}
                </section>
                
                <section>
                    <h2 className="text-3xl font-bold font-headline mb-6">Past Challenges</h2>
                     {pastChallenges.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {pastChallenges.map(challenge => <ChallengeCard key={challenge.id} challenge={challenge} />)}
                        </div>
                    ) : (
                        <Card className="text-center p-8 bg-muted/50 border-dashed">
                           <p className="text-muted-foreground">No past challenges to show yet.</p>
                        </Card>
                    )}
                </section>
            </div>
        </PageWrapper>
    )
}
