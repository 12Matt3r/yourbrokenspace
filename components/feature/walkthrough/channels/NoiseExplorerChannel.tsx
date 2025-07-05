
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Radio,
  Zap,
  UserPlus,
  PlayCircle,
  ListMusic,
  PlusCircle,
  Share2,
  Bookmark,
  MessageCircle,
  Tv2,
  Music2,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';

// Mock data for the hub
const featuredCreators = [
  { id: '1', name: '@datarot', username: 'datarot', bio: 'Analog hardware loops & tape experiments.', avatar: 'https://placehold.co/80x80.png', avatarHint: 'musician avatar' },
  { id: '2', name: '@sineskull', username: 'sineskull', bio: 'Granular dubscapes and glitched ambiences.', avatar: 'https://placehold.co/80x80.png', avatarHint: 'abstract avatar' },
  { id: '3', name: '@dreamrupture', username: 'dreamrupture', bio: 'Feedback modulations and chaotic synthesizers.', avatar: 'https://placehold.co/80x80.png', avatarHint: 'glitch art avatar' },
];

const echoShowcase = [
  { id: 'e1', title: 'Static Bloom', creator: '@datarot', image: 'https://placehold.co/600x400.png', imageHint: 'ambient drone', tags: ['Ambient', 'Drone', 'Experimental'] },
  { id: 'e2', title: 'Broken Signal', creator: '@sineskull', image: 'https://placehold.co/600x400.png', imageHint: 'glitch industrial', tags: ['Glitch', 'Industrial', 'Noise'] },
  { id: 'e3', title: 'Feedback Loop #7', creator: '@dreamrupture', image: 'https://placehold.co/600x400.png', imageHint: 'harsh noise', tags: ['Feedback', 'Harsh Noise', 'Live'] },
  { id: 'e4', title: 'Rustling Textures', creator: '@datarot', image: 'https://placehold.co/600x400.png', imageHint: 'field recording', tags: ['Field Recording', 'ASMR', 'Minimal'] },
];


export function NoiseExplorerChannel() {
  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-900 via-purple-900 to-sky-900 text-slate-100 overflow-y-auto">
      {/* Hero Banner */}
      <header className="relative h-[30vh] flex items-center justify-center overflow-hidden p-4">
        <Image
          src="https://placehold.co/1600x900.png" 
          alt="Abstract waveform background"
          fill
          style={{objectFit:"cover"}}
          className="absolute inset-0 opacity-20 animate-pulse"
          data-ai-hint="abstract waveform glitch"
          priority
        />
        <div className="relative z-10 text-center p-4 backdrop-blur-sm bg-black/40 rounded-lg">
          <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-sky-400 to-violet-400">
            Featured Hub: NOISE EXPLORERS
          </h1>
          <p className="mt-2 text-md md:text-lg text-slate-300 italic max-w-xl mx-auto">
            YourSpace highlights creative communities. This is a simulation of a hub for experimental artists.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Featured Creators Carousel/Slider */}
        <section>
          <h2 className="text-2xl font-semibold font-headline mb-6 text-center flex items-center justify-center gap-3">
            <Zap className="h-7 w-7 text-yellow-400" /> Featured Alchemists
          </h2>
          <ScrollArea className="w-full whitespace-nowrap pb-4">
            <div className="flex space-x-4">
              {featuredCreators.map((creator) => (
                <Card key={creator.id} className="w-[250px] bg-slate-800/70 border-sky-500/30 shadow-xl flex-shrink-0">
                  <CardHeader className="items-center text-center p-4">
                    <Avatar className="w-16 h-16 mb-2 border-2 border-sky-400">
                      <AvatarImage src={creator.avatar} alt={creator.name} data-ai-hint={creator.avatarHint} />
                      <AvatarFallback>{creator.name.substring(1,3).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-lg text-slate-100">{creator.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center p-4 pt-0">
                    <p className="text-xs text-slate-400 h-10 line-clamp-2">{creator.bio}</p>
                  </CardContent>
                  <CardFooter className="flex justify-center gap-2 p-3 border-t border-slate-700">
                     <Button variant="outline" size="sm" className="bg-transparent border-sky-400 text-sky-300 hover:bg-sky-400/20 hover:text-sky-200">
                        <Radio className="mr-2 h-4 w-4" /> View
                      </Button>
                      <Button variant="secondary" size="sm" className="bg-violet-500/80 text-white hover:bg-violet-500">
                        <UserPlus className="mr-2 h-4 w-4" /> Follow
                      </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="bg-slate-700" />
          </ScrollArea>
        </section>

        {/* Echo Showcase Grid */}
        <section>
          <h2 className="text-2xl font-semibold font-headline mb-6 text-center flex items-center justify-center gap-3">
            <ListMusic className="h-7 w-7 text-violet-400" /> Resonating Echoes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {echoShowcase.slice(0, 2).map((echo) => (
              <Card key={echo.id} className="overflow-hidden bg-slate-800/70 border-violet-500/30 shadow-lg group">
                <div className="block">
                  <div className="relative aspect-video bg-slate-700">
                    <Image src={echo.image} alt={echo.title} fill style={{objectFit:"cover"}} data-ai-hint={echo.imageHint} className="group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <PlayCircle className="h-12 w-12 text-white/80" />
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="text-md font-semibold truncate text-slate-100">{echo.title}</h3>
                    <p className="text-xs text-sky-400">{echo.creator}</p>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
