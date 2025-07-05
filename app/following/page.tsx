
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/PageWrapper';
import { CreationFeedCard } from '@/components/feature/explore/CreationFeedCard';
import { Button } from '@/components/ui/button';
import { type Creation } from '@/config/profileData';
import { Users, Rss, Wind, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAllCreations } from '@/lib/firebase/firestoreService';
import { useUser } from '@/contexts/UserContext';


export default function FollowingPage() {
  const [likedCreations, setLikedCreations] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const [feedItems, setFeedItems] = useState<Creation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userProfile, loading: profileLoading } = useUser();

  // This is a mock value, in a real app this would be a user preference
  const isChronological = true;

  useEffect(() => {
    const storedLikes = localStorage.getItem('likedCreations');
    if (storedLikes) {
      setLikedCreations(new Set(JSON.parse(storedLikes)));
    }
  }, []);

  useEffect(() => {
    const fetchFollowedCreations = async () => {
      if (!userProfile) {
        if (!profileLoading) setIsLoading(false); // Stop loading if profile isn't available
        return;
      }

      setIsLoading(true);
      try {
        const allCreations = await getAllCreations();
        
        const followedUserIds = new Set(userProfile.following || []);
        
        const followedCreations = allCreations.filter(creation => 
          followedUserIds.has(creation.authorId)
        );

        if (isChronological) {
          setFeedItems(followedCreations.sort((a, b) => {
            const dateA = a.createdAt ? a.createdAt.toMillis() : 0;
            const dateB = b.createdAt ? b.createdAt.toMillis() : 0;
            return dateB - dateA;
          }));
        } else {
           setFeedItems(followedCreations.sort(() => 0.5 - Math.random()));
        }

      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Error fetching feed',
          description: 'Could not load creations for your feed.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!profileLoading) {
      fetchFollowedCreations();
    }
  }, [toast, isChronological, userProfile, profileLoading]);


  const handleLike = (itemId: string, itemTitle: string) => {
    const newLikedCreations = new Set(likedCreations);
    let toastMessage = '';

    if (newLikedCreations.has(itemId)) {
      newLikedCreations.delete(itemId);
      toastMessage = `Removed "${itemTitle}" from your likes.`;
    } else {
      newLikedCreations.add(itemId);
      toastMessage = `Added "${itemTitle}" to your likes!`;
    }
    setLikedCreations(newLikedCreations);
    localStorage.setItem('likedCreations', JSON.stringify(Array.from(newLikedCreations)));
    toast({
      title: newLikedCreations.has(itemId) ? 'Liked!' : 'Unliked',
      description: toastMessage,
    });
  };

  if (isLoading) {
    return (
      <PageWrapper className="py-12 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading your feed...</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="py-12">
      <header className="mb-12 text-center">
        <Rss className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-5xl font-bold font-headline text-foreground">Your Feed</h1>
        <p className="text-xl text-muted-foreground mt-2">
          The latest creations from the artists and creators you follow.
        </p>
      </header>

      <section className="max-w-2xl mx-auto space-y-8">
        {feedItems.length > 0 ? (
          feedItems.map(item => (
            <CreationFeedCard 
              key={`${item.id}-${item.author}`} // Ensure key is unique
              creation={item}
              isLiked={likedCreations.has(item.id)}
              onLike={handleLike}
            />
          ))
        ) : (
          <div className="text-center py-16 px-6 bg-card rounded-lg shadow-md border">
            <Wind className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground">Your feed is empty!</h2>
            <p className="text-muted-foreground mt-2 mb-6">
              Follow some creators to see their latest work here.
            </p>
            <Link href="/creators">
              <Button>
                <Users className="mr-2 h-4 w-4" /> Discover Creators
              </Button>
            </Link>
          </div>
        )}
      </section>
    </PageWrapper>
  );
}
