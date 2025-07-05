
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, UserCircle, BookOpen, Filter, ListFilter, MessageSquare, Loader2 } from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import { ChatDialog } from '@/components/feature/messaging/ChatDialog';
import type { Creator } from '@/config/messagingData';
import { getAllUsers } from '@/lib/firebase/firestoreService';
import { useToast } from '@/hooks/use-toast';
import type { UserProfileData } from '@/config/profileData';

export default function CreatorsPage() {
  const { toast } = useToast();
  const [allCreators, setAllCreators] = useState<UserProfileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCreatorType, setSelectedCreatorType] = useState('all');
  const [mentorshipFilter, setMentorshipFilter] = useState('all'); // 'all', 'yes', 'no'
  const [filteredCreators, setFilteredCreators] = useState<UserProfileData[]>([]);
  const [chatRecipient, setChatRecipient] = useState<Creator | null>(null);

  useEffect(() => {
    const fetchCreators = async () => {
        setIsLoading(true);
        try {
            const users = await getAllUsers();
            setAllCreators(users);
        } catch (error) {
            console.error("Failed to fetch creators:", error);
            toast({
                variant: 'destructive',
                title: 'Failed to load creators',
                description: 'Could not retrieve user data from the database.'
            });
        } finally {
            setIsLoading(false);
        }
    };
    fetchCreators();
  }, [toast]);

  const uniqueCreatorTypes = useMemo(() => {
    return ['all', ...Array.from(new Set(allCreators.map(c => c.creatorType).filter(Boolean)))];
  }, [allCreators]);


  useEffect(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    let results = allCreators;

    // Filter by search term
    if (searchTerm) {
      results = results.filter(creator =>
        creator.name.toLowerCase().includes(lowerSearchTerm) ||
        creator.usernameParam.toLowerCase().includes(lowerSearchTerm) ||
        creator.creatorType.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Filter by creator type
    if (selectedCreatorType !== 'all') {
      results = results.filter(creator => creator.creatorType === selectedCreatorType);
    }

    // Filter by mentorship availability
    if (mentorshipFilter === 'yes') {
      results = results.filter(creator => creator.availableForMentorship === true);
    } else if (mentorshipFilter === 'no') {
      results = results.filter(creator => !creator.availableForMentorship);
    }

    setFilteredCreators(results);
  }, [searchTerm, selectedCreatorType, mentorshipFilter, allCreators]);

  const handleSetChatRecipient = (creatorData: UserProfileData) => {
    const recipientForChat: Creator = {
      id: creatorData.uid,
      name: creatorData.name,
      usernameParam: creatorData.usernameParam,
      avatarUrl: creatorData.avatarUrl,
      avatarAiHint: creatorData.avatarAiHint,
      creatorType: creatorData.creatorType,
      bioShort: creatorData.bio,
      availableForMentorship: creatorData.availableForMentorship,
    };
    setChatRecipient(recipientForChat);
  }

  return (
    <PageWrapper className="py-8">
      <header className="mb-12 text-center">
        <Users className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-5xl font-bold font-headline text-foreground">Discover Creators</h1>
        <p className="text-xl text-muted-foreground mt-2">Find and connect with talented individuals in the YourSpace community.</p>
      </header>

      <div className="mb-10 p-6 bg-card rounded-lg shadow-lg space-y-6">
        <div>
          <Label htmlFor="search-creators" className="text-lg font-medium">Search Creators</Label>
          <div className="relative mt-1">
            <Input
              id="search-creators"
              type="text"
              placeholder="Search by name, username, or creator type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-base"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
          <div>
            <Label htmlFor="creator-type-filter" className="text-lg font-medium flex items-center">
              <ListFilter className="h-5 w-5 mr-2 text-primary" /> Filter by Creator Type
            </Label>
            <Select value={selectedCreatorType} onValueChange={setSelectedCreatorType}>
              <SelectTrigger id="creator-type-filter" className="w-full mt-1 text-base">
                <SelectValue placeholder="Select creator type" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCreatorTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="mentorship-filter" className="text-lg font-medium flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-primary" /> Filter by Mentorship
            </Label>
            <Select value={mentorshipFilter} onValueChange={setMentorshipFilter}>
              <SelectTrigger id="mentorship-filter" className="w-full mt-1 text-base">
                <SelectValue placeholder="Select mentorship status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Open to Mentorship</SelectItem>
                <SelectItem value="no">Not Open to Mentorship</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : filteredCreators.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredCreators.map(creator => (
            <Card key={creator.uid} className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col">
              <CardHeader className="flex flex-col items-center text-center p-6">
                <Avatar className="h-24 w-24 mb-4 border-2 border-primary">
                  <AvatarImage src={creator.avatarUrl} alt={creator.name} data-ai-hint={creator.avatarAiHint || 'avatar'} />
                  <AvatarFallback>
                    {creator.name ? creator.name.charAt(0).toUpperCase() : <UserCircle className="h-12 w-12" />}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl font-headline text-foreground">{creator.name}</CardTitle>
                <p className="text-sm text-primary">@{creator.usernameParam}</p>
              </CardHeader>
              <CardContent className="p-6 pt-0 text-center flex-grow">
                <Badge variant="secondary" className="mb-2">{creator.creatorType}</Badge>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{creator.bio}</p>
                {creator.availableForMentorship !== undefined && (
                    <Badge variant={creator.availableForMentorship ? "outline" : "default"} className={`text-sm ${creator.availableForMentorship ? 'text-primary border-primary' : 'bg-muted text-muted-foreground border-muted-foreground/30 hover:bg-muted/80'}`}>
                        {creator.availableForMentorship && <BookOpen className="h-4 w-4 mr-1.5" />}
                        {creator.availableForMentorship ? "Open to Mentorship" : "Not Open to Mentorship"}
                    </Badge>
                )}
              </CardContent>
              <CardFooter className="p-4 border-t flex flex-col gap-2">
                <Link href={`/profile/${creator.usernameParam}`} className="w-full">
                  <Button variant="outline" className="w-full">View Profile</Button>
                </Link>
                {creator.usernameParam !== 'me' && (
                  <Button className="w-full" onClick={() => handleSetChatRecipient(creator)}>
                    <MessageSquare className="mr-2 h-4 w-4" /> Message
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground">No Creators Found</h2>
          <p className="text-muted-foreground mt-2">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {chatRecipient && (
        <ChatDialog
          isOpen={!!chatRecipient}
          onClose={() => setChatRecipient(null)}
          recipient={chatRecipient}
        />
      )}

    </PageWrapper>
  );
}
    
