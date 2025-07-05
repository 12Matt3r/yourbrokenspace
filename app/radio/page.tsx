'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Loader2, Radio } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Creation } from '@/config/profileData';
import { getRadioTracks, getDjCommentaryAction } from './actions';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Helper function to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function RadioPage() {
  const { toast } = useToast();
  const [playlist, setPlaylist] = useState<Creation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDjPlaying, setIsDjPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const djAudioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = playlist[currentIndex];

  // Fetch tracks on component mount
  useEffect(() => {
    const fetchAndSetTracks = async () => {
      setIsLoading(true);
      const tracks = await getRadioTracks();
      if (tracks.length > 0) {
        setPlaylist(shuffleArray(tracks));
      } else {
        toast({
          variant: 'destructive',
          title: 'No Audio Tracks Found',
          description: 'There are no audio creations to play on the radio. Upload some music!',
        });
      }
      setIsLoading(false);
    };
    fetchAndSetTracks();
  }, [toast]);

  const handlePlayPause = () => {
    if (!currentTrack) return;
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleNextTrack = useCallback(async () => {
    if (playlist.length === 0) return;
    setIsPlaying(false); // Stop current playback indicator
    setIsDjPlaying(true); // Show DJ indicator
    toast({ title: "Up Next...", description: "AI DJ is preparing the next track." });

    const previousTrackInfo = playlist[currentIndex];
    const nextIndex = (currentIndex + 1) % playlist.length;
    const nextTrackInfo = playlist[nextIndex];

    const commentaryResult = await getDjCommentaryAction({
      previousTrack: { title: previousTrackInfo.title, author: previousTrackInfo.author },
      nextTrack: { title: nextTrackInfo.title, author: nextTrackInfo.author },
    });

    if (commentaryResult.error || !commentaryResult.audioDataUri) {
        toast({ variant: 'destructive', title: 'DJ Error', description: commentaryResult.error || 'Could not generate DJ commentary.' });
        setIsDjPlaying(false);
        setCurrentIndex(nextIndex);
        return;
    }

    if (djAudioRef.current) {
        djAudioRef.current.src = commentaryResult.audioDataUri;
        djAudioRef.current.play().catch(e => console.error("DJ audio play failed", e));
        
        djAudioRef.current.onended = () => {
             setIsDjPlaying(false);
             setCurrentIndex(nextIndex);
        };
    }
  }, [playlist, currentIndex, toast]);

  // Effect to autoplay the next track after DJ finishes or on index change
  useEffect(() => {
    if (!isDjPlaying && currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.externalUrl!;
      audioRef.current.play().catch(e => console.error("Track autoplay failed:", e));
      setIsPlaying(true);
    }
  }, [currentIndex, currentTrack, isDjPlaying]);


  const handlePreviousTrack = () => {
    if (playlist.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + playlist.length) % playlist.length);
  };

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
    if (djAudioRef.current) djAudioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  if (isLoading) {
    return (
      <PageWrapper className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <div className="text-center">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Tuning into YourSpace Radio...</p>
        </div>
      </PageWrapper>
    );
  }

  if (playlist.length === 0 && !isLoading) {
      return (
        <PageWrapper className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <Card className="max-w-md text-center">
                <CardHeader>
                    <Radio className="h-12 w-12 mx-auto text-destructive" />
                    <CardTitle>Radio Silence</CardTitle>
                    <CardDescription>There are no audio Echoes on the platform to play.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">Be the first to contribute to the airwaves!</p>
                    <Link href="/upload"><Button>Upload Music</Button></Link>
                </CardContent>
            </Card>
        </PageWrapper>
      )
  }

  return (
    <PageWrapper className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-gradient-to-br from-background to-muted/50">
      <audio ref={audioRef} onEnded={handleNextTrack} />
      <audio ref={djAudioRef} />
      <Card className="w-full max-w-lg shadow-2xl bg-card/70 backdrop-blur-md border-border/50">
        <CardHeader className="text-center">
          <Radio className="h-8 w-8 mx-auto text-primary animate-pulse" />
          <CardTitle className="text-3xl font-headline">YourSpace Radio</CardTitle>
          <CardDescription>An endless stream of community creations</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="relative w-64 h-64 rounded-lg shadow-lg overflow-hidden">
             <AnimatePresence>
                <motion.div
                    key={currentTrack.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                >
                    <Image
                    src={currentTrack.imageUrl}
                    alt={currentTrack.title}
                    fill
                    style={{objectFit: 'cover'}}
                    data-ai-hint={currentTrack.aiHint}
                    className={cn(isPlaying && 'animate-[spin_20s_linear_infinite]')}
                    />
                </motion.div>
             </AnimatePresence>
          </div>
          <div className="text-center">
            {isDjPlaying ? (
                <>
                    <h2 className="text-2xl font-bold font-headline text-primary">DJ Synthwave Sorceress</h2>
                    <p className="text-muted-foreground">On the mic...</p>
                </>
            ) : (
                <>
                    <h2 className="text-2xl font-bold font-headline">{currentTrack.title}</h2>
                    <Link href={`/profile/${currentTrack.author.toLowerCase().replace(/\s/g, '-')}`}>
                        <p className="text-muted-foreground hover:text-primary transition-colors">{currentTrack.author}</p>
                    </Link>
                </>
            )}
          </div>
          <div className="w-full space-y-4 pt-4">
            <div className="flex items-center justify-center gap-4">
              <Button variant="ghost" size="icon" onClick={handlePreviousTrack} disabled={isDjPlaying}>
                <SkipBack className="h-6 w-6" />
              </Button>
              <Button variant="default" size="icon" onClick={handlePlayPause} className="h-16 w-16 rounded-full shadow-lg" disabled={isDjPlaying}>
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleNextTrack} disabled={isDjPlaying}>
                <SkipForward className="h-6 w-6" />
              </Button>
            </div>
             <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                onValueChange={(value) => setVolume(value[0] / 100)}
                max={100}
                step={1}
                className="w-full"
                disabled={isMuted}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
