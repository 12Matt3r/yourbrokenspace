
'use client';

import type { Creation } from '@/config/profileData';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Heart, Share2, Bookmark, UserPlus, PlayCircle, Palette, Music, Code, Gamepad2, Video, PenTool, Briefcase, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface CreationFeedCardProps {
  creation: Creation;
  isLiked: boolean;
  onLike: (id: string, title: string) => void;
  recommendationReason?: ReactNode;
}

const getTypeIcon = (type: Creation['type']) => {
  switch (type) {
    case 'Image': return <Palette className="h-4 w-4" />;
    case 'Audio': return <Music className="h-4 w-4" />;
    case 'Code': return <Code className="h-4 w-4" />;
    case 'Game': return <Gamepad2 className="h-4 w-4" />;
    case 'Video': return <Video className="h-4 w-4" />;
    case 'Writing': return <PenTool className="h-4 w-4" />;
    default: return <Briefcase className="h-4 w-4" />;
  }
};

export function CreationFeedCard({ creation, isLiked, onLike, recommendationReason }: CreationFeedCardProps) {
  return (
    <Card className="w-full overflow-hidden shadow-xl border-border/70">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <Link href={`/profile/${(creation.author || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
          <Avatar className="h-11 w-11 border-2 border-primary/50">
            {/* Assuming creation.authorAvatarUrl would be added to the Creation type eventually */}
            <AvatarImage src={`https://placehold.co/80x80.png`} alt={creation.author} data-ai-hint="profile avatar" />
            <AvatarFallback>{creation.author.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-grow">
          <Link href={`/profile/${(creation.author || 'unknown').toLowerCase().replace(/\s+/g, '-')}`} className="font-semibold text-foreground hover:underline">
            {creation.authorProfileName || creation.author}
          </Link>
          <p className="text-xs text-muted-foreground">
            Shared a new {creation.type}
          </p>
        </div>
        <Button variant="outline" size="sm" className="ml-auto shrink-0">
          <UserPlus className="mr-2 h-4 w-4" /> Follow
        </Button>
      </CardHeader>
      
      <CardContent className="p-0">
        <Link href={`/creations/${creation.id}`} className="block group">
          <div className="relative aspect-video bg-muted cursor-pointer">
            <Image
              src={creation.imageUrl}
              alt={creation.title}
              fill
              style={{ objectFit: 'cover' }}
              className="group-hover:scale-105 transition-transform duration-300"
              data-ai-hint={creation.aiHint || 'creation thumbnail'}
              unoptimized={creation.imageUrl.startsWith('data:image/svg+xml')}
            />
            { (creation.type === 'Video' || creation.type === 'Game') && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="h-20 w-20 text-white/80" />
                </div>
            )}
          </div>
        </Link>
        <div className="p-4 space-y-2">
           {recommendationReason && (
            <div className="mb-2 p-2 text-sm rounded-md bg-accent/10 text-accent-foreground border border-accent/20 flex items-start gap-2">
              <Sparkles className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <div className="italic">{recommendationReason}</div>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {getTypeIcon(creation.type)}
            <CardTitle className="text-xl font-headline text-foreground truncate">
                <Link href={`/creations/${creation.id}`} className="hover:underline">{creation.title}</Link>
            </CardTitle>
          </div>
          <p className="text-sm text-foreground/90 line-clamp-3">
            {creation.description}
          </p>
           {creation.tags && creation.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {creation.tags.slice(0, 4).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 border-t border-border/70 flex justify-between">
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => onLike(creation.id, creation.title)}>
            <Heart className={cn("mr-2 h-5 w-5", isLiked ? 'text-destructive fill-destructive' : 'text-muted-foreground')} />
            <span className="hidden sm:inline">Like</span>
          </Button>
          <Link href={`/creations/${creation.id}#comments`}>
            <Button variant="ghost" size="sm">
              <MessageSquare className="mr-2 h-5 w-5 text-muted-foreground" />
              <span className="hidden sm:inline">Comment</span>
            </Button>
          </Link>
        </div>
         <div className="flex gap-1">
          <Button variant="ghost" size="sm">
            <Share2 className="mr-2 h-5 w-5 text-muted-foreground" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button variant="ghost" size="sm">
            <Bookmark className="mr-2 h-5 w-5 text-muted-foreground" />
            <span className="hidden sm:inline">Save</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
