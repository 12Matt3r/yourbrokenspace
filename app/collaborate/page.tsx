
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Handshake, Lightbulb, Loader2, Users, AlertTriangle, Sparkles, MessageSquare, ArrowRight, UserCheck, UserPlus, Bookmark, X } from 'lucide-react';
import { getCollaborationSuggestionsAction, type CollaborationSuggestionState } from './actions';
import type { CollaborationSuggesterInput } from '@/ai/flows/collaboration-suggester-flow';
import { PageWrapper } from '@/components/PageWrapper';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';

const initialSuggestionState: CollaborationSuggestionState = {
  message: null,
  suggestions: undefined,
  error: undefined,
  input: undefined,
};

export default function CollaboratePage() {
  const { toast } = useToast();
  const { userProfile, loading: isLoadingProfile } = useUser();
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionState, setSuggestionState] = useState<CollaborationSuggestionState>(initialSuggestionState);
  const [projectNeeds, setProjectNeeds] = useState('');

  const handleGetSuggestions = async () => {
    if (!userProfile) {
      toast({ variant: 'destructive', title: 'Error', description: 'User profile not loaded.' });
      return;
    }

    setIsLoadingSuggestions(true);
    setSuggestionState(initialSuggestionState);

    const inputData: CollaborationSuggesterInput = {
      userName: userProfile.name,
      userCreationsSummary: (userProfile.creations || []).slice(0, 5).map(c => ({
        title: c.title,
        type: c.type,
        description: c.description.substring(0, 100) + (c.description.length > 100 ? '...' : ''),
        tags: c.tags || [],
      })),
      userSkills: userProfile.keySkills,
      userInterests: userProfile.personalVibeTags,
      projectNeeds: projectNeeds.trim(),
    };

    const result = await getCollaborationSuggestionsAction(inputData);
    setSuggestionState(result);
    setIsLoadingSuggestions(false);

    if (result.error) {
      toast({ variant: 'destructive', title: 'Suggestion Error', description: result.error });
    }
  };

  const hasSuggestions = suggestionState.suggestions && suggestionState.suggestions.length > 0 && !isLoadingSuggestions;

  if (isLoadingProfile) {
    return (
      <PageWrapper className="py-12 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading your profile...</p>
      </PageWrapper>
    );
  }

  if (!userProfile) {
    return (
      <PageWrapper className="py-12">
        <Card className="max-w-md mx-auto shadow-lg border-destructive">
          <CardHeader className="bg-destructive/10 text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <CardTitle className="text-2xl text-destructive-foreground">Profile Not Found</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-6">
              We couldn't load your profile data. Please ensure you are logged in and have a complete profile.
            </p>
            <Link href="/profile/me/edit">
              <Button variant="outline">Create or Edit Your Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="py-12">
      <header className="mb-12 text-center">
        <Handshake className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-5xl font-bold font-headline text-foreground">Find Your Spark</h1>
        <p className="text-xl text-muted-foreground mt-2 max-w-2xl mx-auto">
          Let AI help you discover amazing creators for your next big project on YourSpace.
        </p>
      </header>
      
      {!hasSuggestions && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="max-w-2xl mx-auto shadow-lg bg-card/50">
            <CardHeader>
              <CardTitle>Let's Find a Collaborator</CardTitle>
              <CardDescription>The AI will use your profile details to find the best matches. You can also specify what you're looking for.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg bg-background">
                <h4 className="font-semibold text-lg mb-2">Using Your Profile:</h4>
                <div className="text-sm space-y-2 text-muted-foreground">
                  <p><UserCheck className="inline-block h-4 w-4 mr-2 text-primary"/>Name: <span className="font-medium text-foreground">{userProfile.name}</span></p>
                  <div>
                    <p className="flex items-start"><Sparkles className="inline-block h-4 w-4 mr-2 mt-0.5 text-primary shrink-0"/>Skills:</p>
                    <div className="flex flex-wrap gap-1.5 mt-1 ml-6">
                      {userProfile.keySkills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                      {userProfile.keySkills.length === 0 && <span className="text-xs italic">No skills on profile yet. <Link href="/profile/me/edit" className="underline">Add some!</Link></span>}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="projectNeeds" className="text-lg font-semibold">What are you looking for? (Optional)</Label>
                <Textarea
                  id="projectNeeds"
                  value={projectNeeds}
                  onChange={(e) => setProjectNeeds(e.target.value)}
                  placeholder="e.g., 'a vocalist for a pop track', 'a 2D artist for a game jam', 'someone to write lore for my sci-fi world...'"
                  className="mt-2 min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground mt-1">Providing details helps the AI find better matches.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                size="lg"
                onClick={handleGetSuggestions}
                disabled={isLoadingSuggestions || isLoadingProfile}
                className="w-full text-lg py-6 shadow-lg hover:shadow-xl transition-shadow bg-primary hover:bg-primary/90"
              >
                {isLoadingSuggestions ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                {isLoadingSuggestions ? 'Generating Ideas...' : 'Discover Collaborators'}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}

      {suggestionState.error && !isLoadingSuggestions && (
        <Card className="max-w-2xl mx-auto my-8 bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive-foreground flex items-center"><AlertTriangle className="mr-2"/> Error Generating Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground/90">{suggestionState.error}</p>
            {(suggestionState.error?.includes("creations") || suggestionState.error?.includes("skills") || suggestionState.error?.includes("interests")) && (
              <div className="mt-4">
                <Link href="/profile/me/edit">
                  <Button variant="outline" className="text-destructive-foreground border-destructive hover:bg-destructive/20">Update Your Profile</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {hasSuggestions && (
        <section className="mt-12">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-3xl font-bold font-headline text-center mb-8 text-foreground"
          >
            Your Collaboration Matches!
          </motion.h2>
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } }}
             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {suggestionState.suggestions?.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <Card className="bg-card shadow-xl hover:shadow-2xl transition-shadow flex flex-col overflow-hidden h-full">
                  <CardHeader className="bg-card/50">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-2 border-primary">
                        <AvatarImage src={`https://placehold.co/100x100.png?text=${suggestion.collaboratorUsername.substring(0,1)}`} alt={suggestion.collaboratorUsername} data-ai-hint="abstract avatar"/>
                        <AvatarFallback>{suggestion.collaboratorUsername.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-2xl font-semibold text-foreground">{suggestion.collaboratorUsername}</CardTitle>
                        <Badge variant="secondary" className="mt-1 bg-primary/10 text-primary border-primary/20">{suggestion.collaboratorCreatorType}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4 text-muted-foreground">
                    <div>
                      <h4 className="font-semibold text-primary mb-1 flex items-center"><Users className="h-5 w-5 mr-2"/>Why Collaborate?</h4>
                      <p className="text-sm">{suggestion.reasoning}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1 flex items-center"><Lightbulb className="h-5 w-5 mr-2"/>Project Ideas:</h4>
                      <ul className="list-disc list-inside text-sm space-y-1 pl-1">
                        {suggestion.suggestedProjectIdeas.map((idea, ideaIndex) => (
                          <li key={ideaIndex}>{idea}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col sm:flex-row gap-2">
                     <Button className="w-full bg-primary hover:bg-primary/90">
                        <UserPlus className="mr-2 h-4 w-4"/>Connect
                     </Button>
                     <Button variant="outline" className="w-full">
                        <Bookmark className="mr-2 h-4 w-4"/>Save Idea
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          <div className="text-center mt-12">
            <Button variant="outline" onClick={() => setSuggestionState(initialSuggestionState)}>
                <Sparkles className="mr-2 h-4 w-4" /> Start Over
            </Button>
          </div>
        </section>
      )}
    </PageWrapper>
  );
}
