
'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PageWrapper } from '@/components/PageWrapper';
import { Gamepad2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { arcadeGames, type GameItem } from '@/config/games';


export default function ArcadePage() {
  // selectedGame state and related logic is removed. Games will play on their detail page.

  return (
    <PageWrapper className="py-12">
      <header className="mb-12 text-center">
        <Gamepad2 className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-5xl font-bold font-headline text-foreground">YourSpace Arcade</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Relive classic Flash games and discover new interactive experiences.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {arcadeGames.map((game) => (
          <Card 
            key={game.id} 
            className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col"
          >
            <Link href={`/creations/${game.id}`} className="block group h-full flex flex-col">
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                <Image
                    src={game.thumbnail}
                    alt={game.title}
                    fill
                    style={{objectFit:"cover"}}
                    className="group-hover:scale-105 transition-transform duration-300"
                    data-ai-hint={game.aiHint || 'game thumbnail'}
                    unoptimized={game.thumbnail.startsWith('data:image/svg+xml')}
                />
                </div>
                <CardHeader className="p-4">
                <CardTitle className="text-lg font-semibold truncate group-hover:text-primary transition-colors">{game.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-xs text-muted-foreground flex-grow">
                    <p className="mb-2">By {game.author}</p>
                    <div className="flex flex-wrap gap-1">
                        {game.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0.5">{tag}</Badge>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="p-3 mt-auto border-t">
                  {/* The "Play Now" button was removed as the entire card is a link */}
                  <span className="text-xs text-muted-foreground w-full text-center group-hover:text-primary transition-colors">
                    Click to Play
                  </span>
                </CardFooter>
            </Link>
          </Card>
        ))}
      </div>
    </PageWrapper>
  );
}
