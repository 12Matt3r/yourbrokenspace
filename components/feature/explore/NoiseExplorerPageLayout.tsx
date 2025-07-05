
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


export function NoiseExplorerPageLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-sky-900 text-slate-100">
      {/* Hero Banner */}
      <header className="relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden">
        <Image
          src="https://placehold.co/1600x900.png" 
          alt="Abstract waveform background"
          fill
          style={{objectFit:"cover"}}
          className="absolute inset-0 opacity-20 animate-pulse"
          data-ai-hint="abstract waveform glitch"
          priority
        />
        <div className="relative z-10 text-center p-6 backdrop-blur-sm bg-black/40 rounded-lg">
          <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-sky-400 to-violet-400">
            NOISE EXPLORERS
          </h1>
          <p className="mt-4 text-lg md:text-xl text-slate-300 italic max-w-2xl mx-auto">
            "Where static becomes sacred. Where failure sounds divine. Dive into the symphony of dissonance."
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* Featured Creators Carousel/Slider */}
        <section>
          <h2 className="text-3xl font-semibold font-headline mb-8 text-center flex items-center justify-center gap-3">
            <Zap className="h-8 w-8 text-yellow-400" /> Featured Noise Alchemists
          </h2>
          <ScrollArea className="w-full whitespace-nowrap pb-4">
            <div className="flex space-x-6">
              {featuredCreators.map((creator) => (
                <Card key={creator.id} className="w-[280px] md:w-[320px] bg-slate-800/70 border-sky-500/30 shadow-xl hover:shadow-sky-500/20 transition-shadow flex-shrink-0">
                  <CardHeader className="items-center text-center">
                    <Avatar className="w-20 h-20 mb-3 border-2 border-sky-400">
                      <AvatarImage src={creator.avatar} alt={creator.name} data-ai-hint={creator.avatarHint} />
                      <AvatarFallback>{creator.name.substring(1,3).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-xl text-slate-100">{creator.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-slate-400 h-12 line-clamp-2">{creator.bio}</p>
                  </CardContent>
                  <CardFooter className="flex justify-center gap-2 pt-4 border-t border-slate-700">
                    <Link href={`/profile/${creator.username}`}>
                      <Button variant="outline" size="sm" className="bg-transparent border-sky-400 text-sky-300 hover:bg-sky-400/20 hover:text-sky-200">
                        <Radio className="mr-2 h-4 w-4" /> Visit Room
                      </Button>
                    </Link>
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
          <h2 className="text-3xl font-semibold font-headline mb-8 text-center flex items-center justify-center gap-3">
            <ListMusic className="h-8 w-8 text-violet-400" /> Resonating Echoes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {echoShowcase.map((echo) => (
              <Card key={echo.id} className="overflow-hidden bg-slate-800/70 border-violet-500/30 shadow-lg hover:shadow-violet-500/20 transition-shadow group">
                <Link href={`/creations/${echo.id}`} className="block">
                  <div className="relative aspect-video bg-slate-700">
                    <Image src={echo.image} alt={echo.title} fill style={{objectFit:"cover"}} data-ai-hint={echo.imageHint} className="group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <PlayCircle className="h-16 w-16 text-white/80" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold truncate text-slate-100">{echo.title}</h3>
                    <p className="text-sm text-sky-400 hover:underline cursor-pointer">{echo.creator}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {echo.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs bg-slate-700 text-slate-300 border-slate-600">{tag}</Badge>)}
                    </div>
                  </CardContent>
                  <CardFooter className="p-3 border-t border-slate-700 flex justify-between items-center">
                      <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-violet-400 h-8 w-8"><Bookmark className="h-4 w-4"/></Button>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-violet-400 h-8 w-8"><Share2 className="h-4 w-4"/></Button>
                           <Button variant="ghost" size="icon" className="text-slate-400 hover:text-violet-400 h-8 w-8"><MessageCircle className="h-4 w-4"/></Button>
                      </div>
                      <Button variant="outline" size="sm" className="bg-transparent border-violet-400 text-violet-300 hover:bg-violet-400/20 hover:text-violet-200">
                        <Music2 className="mr-2 h-4 w-4"/> Listen
                      </Button>
                  </CardFooter>
                </Link>
              </Card>
            ))}
          </div>
        </section>

        {/* Mini Documentary Embed */}
        <section className="text-center">
          <h2 className="text-3xl font-semibold font-headline mb-8 flex items-center justify-center gap-3">
            <Tv2 className="h-8 w-8 text-sky-400" /> Dive Deeper: The Noise Beneath
          </h2>
          <Card className="max-w-3xl mx-auto bg-slate-800/70 border-sky-500/30 shadow-xl">
            <CardContent className="p-4 md:p-6">
              <div className="aspect-video bg-slate-700 rounded-md flex items-center justify-center mb-4">
                <Image src="https://placehold.co/1280x720.png" alt="Video placeholder for The Noise Beneath" width={1280} height={720} className="rounded-md" data-ai-hint="documentary film still"/>
              </div>
              <CardTitle className="text-xl text-slate-100 mb-2">The Noise Beneath: A Sonic Exploration</CardTitle>
              <CardDescription className="text-slate-400 mb-4">
                A 3-minute short film introducing the diverse world of noise artistry and experimental sound design within the YourSpace community.
              </CardDescription>
              <Button size="lg" className="bg-gradient-to-r from-sky-500 to-violet-500 hover:from-sky-600 hover:to-violet-600 text-white">
                <PlayCircle className="mr-2 h-5 w-5"/> Watch Now (Mock)
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Join the Category */}
        <section className="text-center py-12 border-t border-b border-slate-700/50 my-12">
          <h2 className="text-3xl font-semibold font-headline mb-6 text-slate-100 flex items-center justify-center gap-3">
            <PlusCircle className="h-8 w-8 text-green-400" /> Become a Noise Explorer
          </h2>
          <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto">
            Share your unique soundscapes, glitch experiments, or ambient drones. Tag your work and join the collective dissonance.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/upload">
              <Button size="lg" variant="secondary" className="bg-green-500/80 hover:bg-green-500 text-white">
                <PlusCircle className="mr-2 h-5 w-5" /> Upload Your Noise Echo
              </Button>
            </Link>
            <Link href="/learning">
                <Button size="lg" variant="outline" className="border-green-400 text-green-300 hover:bg-green-400/20 hover:text-green-200">
                <BookOpen className="mr-2 h-5 w-5" /> Read Noise Explorer Guide
                </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
