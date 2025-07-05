'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Palette, Music, Code, PenTool, Gamepad2, Sparkles, ArrowRight, Loader2, PlusCircle } from 'lucide-react';
import type { Guild } from '@/config/guildData';
import { getAllGuilds } from '@/lib/firebase/firestoreService';
import { useToast } from '@/hooks/use-toast';


function GuildIcon({ iconName }: { iconName: Guild['icon'] }) {
    const props = { className: "h-8 w-8 text-primary" };
    switch (iconName) {
        case 'Palette': return <Palette {...props} />;
        case 'Music': return <Music {...props} />;
        case 'Code': return <Code {...props} />;
        case 'PenTool': return <PenTool {...props} />;
        case 'Gamepad2': return <Gamepad2 {...props} />;
        case 'Sparkles': return <Sparkles {...props} />;
        case 'Users': return <Users {...props} />;
        default: return <Users {...props} />;
    }
}

function GuildCard({ guild }: { guild: Guild }) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow bg-card/80 flex flex-col group">
      <CardHeader className="flex-row items-start gap-4">
        <div className="p-3 bg-muted rounded-full">
            <GuildIcon iconName={guild.icon} />
        </div>
        <div>
          <CardTitle className="text-2xl font-headline group-hover:text-primary transition-colors">{guild.name}</CardTitle>
          <CardDescription>{guild.members.length} members</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground line-clamp-3">{guild.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-4 mt-auto">
        <div className="flex -space-x-2 overflow-hidden">
            {guild.members.slice(0, 4).map(member => (
                <Avatar key={member.uid} className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                    <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint={member.avatarAiHint || 'user avatar'} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
            ))}
            {guild.members.length > 4 && (
                <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                    <AvatarFallback>+{guild.members.length - 4}</AvatarFallback>
                </Avatar>
            )}
        </div>
        <Link href={`/guilds/${guild.id}`}>
          <Button>
            View Guild <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function GuildsPage() {
    const [allGuilds, setAllGuilds] = useState<Guild[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchGuilds = async () => {
            setIsLoading(true);
            try {
                const guildsFromDb = await getAllGuilds();
                setAllGuilds(guildsFromDb);
            } catch (error) {
                console.error("Failed to fetch guilds:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load guilds from the database.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchGuilds();
    }, [toast]);

    return (
        <PageWrapper className="py-12">
            <header className="mb-12 text-center">
                <Users className="h-16 w-16 text-primary mx-auto mb-4" />
                <h1 className="text-5xl font-bold font-headline text-foreground">Creative Guilds</h1>
                <p className="text-xl text-muted-foreground mt-2 max-w-2xl mx-auto">
                    Find your tribe. Join communities of like-minded creators to collaborate, share, and grow together.
                </p>
            </header>
            
            <div className="text-center mb-8">
                <Link href="/guilds/create">
                    <Button size="lg">
                        <PlusCircle className="mr-2 h-5 w-5" /> Create Your Own Guild
                    </Button>
                </Link>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-16">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : allGuilds.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {allGuilds.map(guild => (
                        <GuildCard key={guild.id} guild={guild} />
                    ))}
                </div>
            ) : (
                <Card className="text-center p-8 bg-muted/50 border-dashed">
                    <p className="text-muted-foreground">No guilds found. Why not start one?</p>
                </Card>
            )}
        </PageWrapper>
    );
}
