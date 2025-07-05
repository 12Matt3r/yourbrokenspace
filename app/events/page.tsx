
'use client';

import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { type YourSpaceEvent } from '@/config/eventsData';
import { Calendar, Users, Video, Mic, Palette, Ticket, Youtube, Twitch, Radio, Check, PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAllEvents } from '@/lib/firebase/firestoreService';

function EventTypeIcon({ type }: { type: YourSpaceEvent['type'] }) {
    switch (type) {
        case 'Livestream Q&A':
            return <Video className="h-5 w-5 text-primary" />;
        case 'Virtual Gallery':
            return <Palette className="h-5 w-5 text-accent" />;
        case 'Listening Party':
            return <Mic className="h-5 w-5 text-green-500" />;
        case 'Workshop':
            return <Users className="h-5 w-5 text-yellow-500" />;
        default:
            return <Calendar className="h-5 w-5 text-primary" />;
    }
}

function PlatformIcon({ platform }: { platform: YourSpaceEvent['platform'] }) {
    switch (platform) {
        case 'Twitch': return <Twitch className="h-4 w-4" />;
        case 'YouTube': return <Youtube className="h-4 w-4" />;
        case 'YourSpace Live': return <Radio className="h-4 w-4" />;
        default: return null;
    }
}

function EventCard({ event }: { event: YourSpaceEvent }) {
  const { toast } = useToast();
  const [isRsvpd, setIsRsvpd] = useState(false);
  const [rsvpCount, setRsvpCount] = useState(event.rsvps);

  const handleRsvpClick = () => {
    if (isRsvpd) {
      setIsRsvpd(false);
      setRsvpCount(prev => prev - 1);
      toast({
        title: "RSVP Canceled",
        description: `You are no longer attending "${event.title}".`,
      });
    } else {
      setIsRsvpd(true);
      setRsvpCount(prev => prev + 1);
      toast({
        title: "You're Attending!",
        description: `You've RSVP'd to "${event.title}". We'll remind you. (This is a mock action.)`,
      });
    }
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow bg-card/80 flex flex-col group overflow-hidden">
        <div className="relative aspect-video bg-muted overflow-hidden">
            <Image
                src={event.coverImageUrl}
                alt={event.title}
                fill
                style={{objectFit: 'cover'}}
                data-ai-hint={event.coverImageAiHint}
                className="group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 right-2 flex items-center gap-2">
                <Badge variant="secondary" className="capitalize backdrop-blur-sm bg-background/70">
                    <EventTypeIcon type={event.type} />
                    <span className="ml-2">{event.type}</span>
                </Badge>
            </div>
        </div>
      <CardHeader>
        <CardTitle className="text-2xl font-headline group-hover:text-primary transition-colors">{event.title}</CardTitle>
        <CardDescription>Hosted by <Link href={`/profile/${event.hostUsername}`} className="text-primary/90 hover:underline font-semibold">{event.hostName}</Link></CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
        <div className="flex flex-wrap gap-2">
            {event.tags.map((tag) => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t pt-4 mt-auto">
        <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span>{format(new Date(event.date), "EEE, MMM d, yyyy 'at' h:mm a")}</span>
            </div>
             <div className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                <span>{rsvpCount.toLocaleString()} attending</span>
            </div>
        </div>
        <Button onClick={handleRsvpClick} variant={isRsvpd ? 'secondary' : 'default'}>
          {isRsvpd ? <Check className="mr-2 h-4 w-4" /> : <Ticket className="mr-2 h-4 w-4" />}
          {isRsvpd ? 'Attending' : 'RSVP'}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function EventsPage() {
    const { toast } = useToast();
    const [allEvents, setAllEvents] = useState<YourSpaceEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            try {
                const firestoreEvents = await getAllEvents();
                setAllEvents(firestoreEvents);
            } catch(error) {
                console.error("Failed to fetch events:", error);
                toast({
                    variant: 'destructive',
                    title: 'Failed to load events',
                    description: 'Could not retrieve events from the database.'
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, [toast]);
    
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
                <Calendar className="h-16 w-16 text-primary mx-auto mb-4" />
                <h1 className="text-5xl font-bold font-headline text-foreground">Community Events</h1>
                <p className="text-xl text-muted-foreground mt-2">
                    Join live events hosted by creators from across the YourSpace ecosystem.
                </p>
            </header>
            
            <div className="text-center mb-8">
                <Link href="/event-planner">
                    <Button size="lg">
                        <PlusCircle className="mr-2 h-5 w-5" /> Host Your Own Event
                    </Button>
                </Link>
            </div>

            {allEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {allEvents.map(event => <EventCard key={event.id} event={event} />)}
                </div>
            ) : (
                <Card className="text-center p-8 bg-muted/50 border-dashed">
                    <p className="text-muted-foreground">No community events scheduled right now. Why not host your own?</p>
                </Card>
            )}
        </PageWrapper>
    );
}
