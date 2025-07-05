
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, type ChangeEvent, type FormEvent, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { UserCircle, Heart, MessageSquare, Edit3, Image as ImageIconLucide, Music, Code, Video, Link as LinkIcon, Palette as PaletteIcon, PenTool, Gamepad2, ArrowLeft, PlayCircle, AlertTriangle, Loader2, Send, Tag, SmilePlus, GitFork, Mic, MoreVertical, ShieldAlert, Trash2 } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageWrapper } from '@/components/PageWrapper';
import type { Creation, Comment } from '@/config/profileData';
import { addCommentAction, narrateTextAction } from './actions';
import { RemixChainDialog } from '@/components/feature/creations/RemixChainDialog';
import { getCreation, getCommentsForCreation, deleteCreation } from '@/lib/firebase/firestoreService';
import { useUser } from '@/contexts/UserContext';
import { arcadeGames } from '@/config/games'; // Keep for game lookups
import { ReportDialog } from '@/components/feature/moderation/ReportDialog';

const getTypeIcon = (type: Creation['type']) => {
  switch (type) {
    case 'Image': 
        return <PaletteIcon className="h-5 w-5" />;
    case 'Audio':
        return <Music className="h-5 w-5" />;
    case 'Code': return <Code className="h-5 w-5" />;
    case 'Game': return <Gamepad2 className="h-5 w-5" />;
    case 'Video': return <Video className="h-5 w-5" />;
    case 'Writing': return <PenTool className="h-5 w-5" />;
    default: return null;
  }
};

export default function CreationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const router = useRouter();
  const { userProfile } = useUser();
  const [creation, setCreation] = useState<Creation | null>(null);
  const isOwner = userProfile?.uid === creation?.authorId;

  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showGameOverlay, setShowGameOverlay] = useState(true);

  const [narrationUri, setNarrationUri] = useState<string | null>(null);
  const [isNarrating, setIsNarrating] = useState(false);
  const [narrationError, setNarrationError] = useState<string | null>(null);
  const [isRemixDialogOpen, setIsRemixDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    
    const fetchCreationData = async () => {
      let foundCreation: Creation | null = null;
      let isArcadeGame = false;

      // First, try fetching from Firestore
      foundCreation = await getCreation(id);

      // If not in Firestore, check arcade games (for legacy/static content)
      if (!foundCreation) {
        const gameFromArcade = arcadeGames.find(g => String(g.id) === id);
        if (gameFromArcade) {
          isArcadeGame = true;
          foundCreation = {
            id: String(gameFromArcade.id),
            authorId: 'arcade-author',
            type: 'Game',
            title: gameFromArcade.title,
            author: gameFromArcade.author,
            authorProfileName: gameFromArcade.author, 
            imageUrl: gameFromArcade.thumbnail,
            aiHint: gameFromArcade.aiHint || gameFromArcade.title.toLowerCase().split(' ').slice(0,2).join(' ') || 'game thumbnail',
            description: `Play ${gameFromArcade.title}, a classic Flash game by ${gameFromArcade.author}. Tags: ${gameFromArcade.tags.join(', ')}.`,
            longDescription: gameFromArcade.rating ? `Rating: ${gameFromArcade.rating}/5.0. Author: ${gameFromArcade.author}.` : `Author: ${gameFromArcade.author}.`,
            gameSrc: gameFromArcade.src,
            gameWidth: gameFromArcade.width,
            gameHeight: gameFromArcade.height,
            tags: gameFromArcade.tags || [],
          };
        }
      }

      if (foundCreation) {
        setCreation(foundCreation);
        if (!isArcadeGame) { // Don't fetch comments for static arcade games
            const fetchedComments = await getCommentsForCreation(id);
            setComments(fetchedComments);
        }
      } else {
        setError("Creation not found.");
        toast({ variant: 'destructive', title: 'Error', description: 'Could not find the requested creation.' });
      }
      setIsLoading(false);
    };

    fetchCreationData();
  }, [id, toast]);


  const handleCommentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newCommentText.trim() || !creation || !userProfile) {
      toast({
        variant: "destructive",
        title: "Cannot post comment",
        description: "Please write something and make sure you're logged in.",
      });
      return;
    }

    const authorInfo = {
      uid: userProfile.uid,
      name: userProfile.name,
      usernameParam: userProfile.usernameParam,
      avatarUrl: userProfile.avatarUrl,
      avatarAiHint: userProfile.avatarAiHint,
    };

    const result = await addCommentAction(creation.id, newCommentText, authorInfo);
    
    if(result.success) {
      // Optimistically add comment to UI while it saves
      const newCommentToAdd: Comment = {
        id: `comment-pending-${Date.now()}`,
        authorId: userProfile.uid,
        authorName: userProfile.name,
        authorUsername: userProfile.usernameParam,
        authorAvatarUrl: userProfile.avatarUrl,
        authorAvatarAiHint: userProfile.avatarAiHint,
        text: newCommentText,
        createdAt: new Date() as any, // Temporary
      };
      setComments(prevComments => [newCommentToAdd, ...prevComments]);
      setNewCommentText('');
      toast({ title: "Comment Posted!", description: "Your comment has been added." });
      
      // Refresh comments from DB to get the final version
      const refreshedComments = await getCommentsForCreation(creation.id);
      setComments(refreshedComments);

    } else {
      toast({ variant: "destructive", title: "Failed to post comment", description: result.error });
    }
  };

  const handleDeleteCreation = async () => {
    if (!isOwner || !creation) return;
    try {
        await deleteCreation(creation.id);
        toast({
          title: "Creation Deleted",
          description: `"${creation.title}" has been removed from your profile.`,
        });
        router.push('/profile/me');
    } catch (error) {
        console.error("Failed to delete creation:", error);
        toast({ variant: 'destructive', title: 'Delete Failed', description: 'Could not remove the creation.' });
    }
  };


  const handleEditCreation = (creation: Creation) => {
    // This functionality will be disabled in the upload page for this step to simplify
    toast({ title: 'Editing coming soon!', description: 'For now, please delete and re-upload to make changes.'});
    // router.push(`/upload?edit=true&creationId=${creation.id}&title=${encodeURIComponent(creation.title)}`);
  };

  const handleLike = (creationTitle: string) => {
    toast({
      title: "Liked!",
      description: `You liked "${creationTitle}". (This is a mock-up)`,
    });
  };

  const handleGameClick = () => {
    iframeRef.current?.requestPointerLock();
    if (showGameOverlay) {
      setShowGameOverlay(false);
    }
  };

  async function handleNarrate() {
    if (!creation || (creation.type !== 'Writing' && !creation.longDescription)) return;
    setIsNarrating(true);
    setNarrationError(null);
    setNarrationUri(null);

    const textToNarrate = creation.longDescription || creation.description;
    
    const result = await narrateTextAction(textToNarrate);

    setIsNarrating(false);
    if ('media' in result) {
        setNarrationUri(result.media);
        toast({
            title: 'Narration Ready!',
            description: 'The AI-powered narration has been generated.',
        });
    } else {
        setNarrationError(result.error);
        toast({
            variant: 'destructive',
            title: 'Narration Failed',
            description: result.error,
        });
    }
}


  if (isLoading) {
    return (
      <PageWrapper className="py-12 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </PageWrapper>
    );
  }

  if (error || !creation) {
    return (
      <PageWrapper className="py-12">
        <Card className="max-w-md mx-auto shadow-lg border-destructive">
          <CardHeader className="bg-destructive/10 text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <CardTitle className="text-2xl text-destructive-foreground">Creation Not Found</CardTitle>
             <CardDescription>{error || `The creation with ID "${id}" could not be found.`}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-6">
              Sorry, we couldn&apos;t find what you were looking for. The ID might be incorrect or the creation may have been removed.
            </p>
            <Link href="/explore">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Explore
              </Button>
            </Link>
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="py-12">
       {creation.remixOf && (
        <Card className="max-w-4xl mx-auto mb-6 shadow-md border-accent bg-accent/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <GitFork className="h-6 w-6 text-accent-foreground" />
                  <div>
                    <p className="text-sm text-accent-foreground/80">
                      Remix of: <Link href={`/creations/${creation.remixOf.id}`} className="font-semibold text-accent-foreground hover:underline">
                      {creation.remixOf.title}
                      </Link> <span className="font-normal text-accent-foreground/80">by {creation.remixOf.author}</span>
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsRemixDialogOpen(true)}>
                    <GitFork className="mr-2 h-4 w-4" /> View Chain
                </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="max-w-4xl mx-auto shadow-xl overflow-hidden border-border">
        <div className="relative">
          {creation.type === 'Game' && creation.gameSrc && creation.gameWidth && creation.gameHeight ? (
              <div 
                className="w-full bg-black flex justify-center items-center relative cursor-pointer" 
                style={{ height: creation.gameHeight, maxHeight: '80vh' }}
                onClick={handleGameClick}
              >
                {showGameOverlay && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 pointer-events-none">
                    <div className="text-center text-white p-6 rounded-lg bg-black/70 shadow-lg border border-primary/50">
                      <PlayCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <h3 className="text-2xl font-bold">Click to Play</h3>
                      <p className="text-sm mt-1 max-w-xs">Your mouse will be locked for an immersive gameplay experience. Press the <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Esc</kbd> key to unlock.</p>
                    </div>
                  </div>
                )}
                <iframe
                  ref={iframeRef}
                  src={creation.gameSrc}
                  width={creation.gameWidth}
                  height={creation.gameHeight}
                  title={creation.title}
                  allow="fullscreen; pointer-lock"
                  scrolling="no"
                  className="border-0 max-w-full"
                />
              </div>
          ) : creation.type === 'Video' && creation.externalUrl ? (
            <div 
              className="relative w-full aspect-video bg-muted group cursor-pointer" 
              onClick={() => window.open(creation.externalUrl, '_blank')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') window.open(creation.externalUrl!, '_blank')}}
              role="button"
              tabIndex={0}
              aria-label={`Play video: ${creation.title}`}
            >
              <Image
                src={creation.imageUrl}
                alt={creation.title}
                fill
                style={{objectFit: 'cover'}}
                data-ai-hint={creation.aiHint}
                className="transition-transform duration-300 group-hover:scale-105"
                unoptimized={creation.imageUrl.startsWith('data:image/svg+xml')}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                <PlayCircle className="h-20 w-20 text-white/80 group-hover:text-white transition-colors transform group-hover:scale-110" />
              </div>
            </div>
          ) : (
            <div className="relative w-full aspect-[16/9] md:aspect-[2/1] bg-muted group">
              <Image
                src={creation.imageUrl}
                alt={creation.title}
                fill
                style={{objectFit: 'cover'}}
                data-ai-hint={creation.aiHint}
                className="transition-transform duration-300 group-hover:scale-105"
                unoptimized={creation.imageUrl.startsWith('data:image/svg+xml')}
              />
            </div>
          )}
           <div className="absolute top-4 right-4 bg-card/90 p-2 rounded-md backdrop-blur-sm shadow-md">
              <Badge variant="secondary" className="text-sm flex items-center gap-2 py-1 px-3">
                  {getTypeIcon(creation.type)}
                  {creation.type}
              </Badge>
          </div>
        </div>
        
        {creation.type === 'Audio' && creation.externalUrl && ( 
          <Card className="mt-0 border-x-0 border-b-0 rounded-t-none rounded-b-lg bg-muted/30">
            <CardContent className="p-4 flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="icon" 
                className="bg-card hover:bg-card/90" 
                onClick={() => creation.externalUrl && window.open(creation.externalUrl, '_blank')}
                aria-label={`Play music: ${creation.title} on external platform`}
              >
                <PlayCircle className="h-5 w-5 text-primary" />
              </Button>
              <div className="flex-grow">
                <p className="font-semibold text-foreground">{creation.title}</p>
                <p className="text-sm text-muted-foreground">Click to play</p> 
                <Link href={creation.externalUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                    Listen on external platform
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
        
        <CardHeader className="pt-6 px-6 md:px-8">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl lg:text-4xl font-headline text-foreground">
                {creation.title}
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground pt-1">
                By <Link href={`/profile/${(creation.author || 'unknown').toLowerCase().replace(/\s+/g, '-')}`} className="text-primary hover:underline font-medium">{creation.authorProfileName || creation.author || 'Unknown Creator'}</Link>
              </CardDescription>
            </div>
            <div className="flex items-center ml-4 mt-1">
              {isOwner ? (
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => handleEditCreation(creation)} className="h-8 px-2"><Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="destructive" size="sm" className="h-8 px-2"><Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete</Button></AlertDialogTrigger>
                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete "{creation.title}".</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteCreation} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                  </AlertDialog>
                </div>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleLike(creation.title)}
                    aria-label={`Like ${creation.title}`}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Heart className="h-6 w-6" />
                  </Button>
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-muted-foreground">
                              <MoreVertical className="h-5 w-5" />
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setIsReportDialogOpen(true)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                              <ShieldAlert className="mr-2 h-4 w-4" />
                              <span>Report Creation</span>
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-lg space-y-4 px-6 md:px-8 pb-6">
          <p className="text-foreground/90">{creation.description}</p>
          {creation.longDescription && (
            <div className="pt-6 border-t border-border/70">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-semibold text-foreground">
                    {creation.type === 'Writing' ? 'Content' : 'More Details'}
                </h3>
                {(creation.type === 'Writing' || creation.longDescription) && (
                    <Button onClick={handleNarrate} disabled={isNarrating} variant="outline">
                        {isNarrating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mic className="mr-2 h-4 w-4" />}
                        {isNarrating ? 'Narrating...' : 'Narrate with AI'}
                    </Button>
                )}
              </div>
              {narrationUri && (
                <div className="my-4">
                    <audio controls src={narrationUri} className="w-full">
                        Your browser does not support the audio element.
                    </audio>
                </div>
              )}
              {narrationError && (
                  <div className="my-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{narrationError}</span>
                  </div>
              )}
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{creation.longDescription}</p>
            </div>
          )}
           {(creation.tags && creation.tags.length > 0 || creation.mood) && (
            <div className="pt-6 border-t border-border/70 space-y-3">
              {creation.tags && creation.tags.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground flex items-center"><Tag className="h-5 w-5 mr-2 text-primary" />Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {creation.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-sm">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {creation.mood && (
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground flex items-center"><SmilePlus className="h-5 w-5 mr-2 text-primary" />Mood</h3>
                  <Badge variant="outline" className="text-sm capitalize border-accent text-accent-foreground">{creation.mood}</Badge>
                </div>
              )}
            </div>
          )}
          {creation.type === 'Code' && creation.externalUrl && (
             <div className="pt-6 border-t border-border/70">
                 <h3 className="text-xl font-semibold mb-2 text-foreground">View Code</h3>
                 <Link href={creation.externalUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline"><Code className="mr-2 h-4 w-4" /> View on GitHub/Source</Button>
                 </Link>
             </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/50 p-6 md:px-8 border-t border-border/70 flex justify-between items-center">
          <Link href={creation.type.toLowerCase() === 'game' ? "/arcade" : "/explore"}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {creation.type.toLowerCase() === 'game' ? "Arcade" : "Explore"}
            </Button>
          </Link>
        </CardFooter>
      </Card>

      {/* Comments Section */}
      <Card id="comments" className="max-w-4xl mx-auto mt-8 shadow-xl border-border">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <MessageSquare className="mr-3 h-6 w-6 text-primary" /> Comments ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCommentSubmit} className="mb-6 space-y-4">
            <div>
              <label htmlFor="newComment" className="sr-only">Add a comment</label>
              <Textarea
                id="newComment"
                value={newCommentText}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewCommentText(e.target.value)}
                placeholder={`Share your thoughts on "${creation.title}"...`}
                className="min-h-[100px] text-base"
                rows={3}
                disabled={!userProfile}
              />
            </div>
            <Button type="submit" disabled={!newCommentText.trim() || !userProfile}>
              <Send className="mr-2 h-4 w-4" /> Post Comment
            </Button>
            {!userProfile && <p className="text-xs text-muted-foreground">You must be logged in to comment.</p>}
          </form>

          <div className="space-y-6">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="flex items-start space-x-4 p-4 border rounded-lg shadow-sm bg-card/50">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={comment.authorAvatarUrl} alt={comment.authorName} data-ai-hint={comment.authorAvatarAiHint || 'user avatar'}/>
                    <AvatarFallback>{comment.authorName?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <Link href={`/profile/${comment.authorUsername.toLowerCase()}`} className="font-semibold text-sm text-foreground hover:underline">
                        {comment.authorName}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{comment.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No comments yet. Be the first to share your thoughts!</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <RemixChainDialog
        isOpen={isRemixDialogOpen}
        onClose={() => setIsRemixDialogOpen(false)}
        startCreation={creation}
      />
       <ReportDialog
        isOpen={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
        reportType="creation"
        targetName={creation.title}
        targetId={creation.id}
      />
    </PageWrapper>
  );
}
