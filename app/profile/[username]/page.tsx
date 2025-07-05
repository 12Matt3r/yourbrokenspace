
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCircle, Briefcase, Heart, MessageSquare, ShoppingBag, Edit3, Image as ImageIconLucide, Music, Code, Video, UserPlus, Link as LinkIcon, Award, Palette as PaletteIcon, DollarSign, Info, BookOpen, Users2, Mic2, Trash2, Send, UserCheck, PenTool, Gamepad2, Feather, Tag, LayoutDashboard, Sparkles, GitFork, PackageOpen, UploadCloud, Layers, HeartHandshake, Loader2, AlertCircle, Ban, ShieldAlert, Gift } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { type UserProfileData, type Creation, type ShopItem, type Comment, type MoodboardItem, type Supporter, baseUserProfile } from '@/config/profileData'; 
import { motion, Reorder } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChatDialog } from '@/components/feature/messaging/ChatDialog';
import type { Creator } from '@/config/messagingData';
import { useUser } from '@/contexts/UserContext';
import { getUserProfile, getUserByUsername, getUserCreations, deleteCreation } from '@/lib/firebase/firestoreService';
import { ReportDialog } from '@/components/feature/moderation/ReportDialog';
import { blockUserAction } from '@/lib/actions/moderationActions';

function TipPopover({ recipientName }: { recipientName: string }) {
    const { toast } = useToast();
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline"><Gift className="mr-2 h-4 w-4 text-green-500" /> Tip</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Send a Tip to {recipientName}</h4>
                        <p className="text-sm text-muted-foreground">Show your support for their work! (Tipping UI mock-up)</p>
                    </div>
                     <Button onClick={() => toast({ title: `You tipped ${recipientName} $5!`})}>
                        Send $5 Tip
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}


export default function UserProfilePage() {
  const routeParams = useParams();
  const username = routeParams.username as string;
  const { toast } = useToast();
  const router = useRouter();

  const [currentProfile, setCurrentProfile] = useState<UserProfileData | null>(null);
  const [userCreations, setUserCreations] = useState<Creation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { userProfile: loggedInUserProfile, loading: authLoading } = useUser();
  const isOwner = loggedInUserProfile?.usernameParam === username || (username === 'me' && !!loggedInUserProfile);
  
  const tabConfig = [
    { id: 'creations', label: 'Creations' },
    { id: 'moodboard', label: 'Moodboard' },
    { id: 'shop', label: 'Shop' },
    { id: 'supporters', label: 'Supporters' },
    { id: 'about', label: 'About' },
  ];

  const [orderedTabs, setOrderedTabs] = useState(tabConfig);
  const [activeTab, setActiveTab] = useState<string>("creations");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);


  useEffect(() => {
    const fetchProfileData = async () => {
        setIsLoading(true);
        const usernameToFetch = username === 'me' ? loggedInUserProfile?.usernameParam : username;

        if (!usernameToFetch) {
            if (!authLoading) { // Only show error if auth has resolved
                toast({ variant: 'destructive', title: 'Could not identify user.' });
                router.push('/explore');
            }
            return;
        }

        const userData = await getUserByUsername(usernameToFetch);

        if (userData) {
            setCurrentProfile(userData.profile);
            const creationsData = await getUserCreations(userData.uid);
            setUserCreations(creationsData);

            const savedTabOrder = userData.profile.customization?.tabOrder;
            if (savedTabOrder && Array.isArray(savedTabOrder) && savedTabOrder.length > 0) {
              const currentTabIds = new Set(tabConfig.map(t => t.id));
              const savedTabIds = new Set(savedTabOrder);
              const ordered = savedTabOrder.map(id => tabConfig.find(t => t.id === id)).filter((t): t is typeof tabConfig[0] => !!t);
              const newTabs = tabConfig.filter(t => !savedTabIds.has(t.id));
              setOrderedTabs([...ordered, ...newTabs]);
            } else {
              setOrderedTabs(tabConfig);
            }

        } else {
            toast({ variant: 'destructive', title: 'Profile Not Found' });
            router.push('/explore');
        }
        setIsLoading(false);
    };

    // Don't fetch until auth state is resolved
    if (!authLoading) {
      fetchProfileData();
    }
  }, [username, authLoading, loggedInUserProfile, router, toast]);

  
  const handleTabReorder = (newOrder: typeof tabConfig) => {
    // This function is now client-side only and doesn't persist to DB for simplicity in this step.
    // A real implementation would call updateUserProfile here.
    setOrderedTabs(newOrder);
    toast({
      title: "Layout Updated",
      description: "Your new tab order is set for this session.",
    });
  };

  const handleDeleteCreation = async (creationId: string, creationTitle: string) => {
    if (!isOwner) return;
    try {
        await deleteCreation(creationId);
        setUserCreations(prev => prev.filter(c => c.id !== creationId));
        toast({
          title: "Creation Deleted",
          description: `"${creationTitle}" has been removed from your profile.`,
        });
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

  const handleAddToCart = (itemTitle: string) => {
    toast({ title: 'Added to Cart!', description: `"${itemTitle}" has been added. (Mock-up)` });
  };
  
  const handleBlockUser = async () => {
    if (!currentProfile?.uid || !loggedInUserProfile) return;
    if (currentProfile.uid === loggedInUserProfile.uid) {
        toast({ variant: "destructive", title: "Error", description: "You cannot block yourself." });
        return;
    }

    setIsBlocking(true);
    const result = await blockUserAction(currentProfile.uid);
    setIsBlocking(false);

    if (result.success) {
      toast({ title: 'User Blocked', description: `You have blocked @${currentProfile.usernameParam}.` });
      setIsBlockDialogOpen(false);
      // Optional: redirect away from the profile or disable interactions
      router.push('/explore');
    } else {
      toast({ variant: 'destructive', title: 'Block Failed', description: result.error });
    }
  };

  const getIconForType = (type: Creation['type'] | string ) => {
    switch (type?.toLowerCase()) {
      case 'image': return <PaletteIcon className="h-5 w-5" />;
      case 'audio': return <Music className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'code': return <Code className="h-5 w-5" />;
      case 'writing': return <PenTool className="h-5 w-5" />;
      case 'game': return <Gamepad2 className="h-5 w-5" />;
      default: return <Briefcase className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  if (!currentProfile) {
    return (
        <div className="container mx-auto py-12 px-4 text-center">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-3xl font-bold">Profile Not Found</h1>
            <p className="text-muted-foreground mt-2">The profile for "{username}" could not be loaded.</p>
            <Link href="/explore"><Button variant="outline" className="mt-6">Go to Explore</Button></Link>
        </div>
    );
  }

  // Safely merge fetched customization with defaults to prevent crashes
  const customization = {
      ...baseUserProfile.customization,
      ...(currentProfile.customization || {})
  };

  const customStyles: React.CSSProperties = {
    '--profile-bg': customization.pageBackgroundColor,
    '--profile-text': customization.pageTextColor,
    '--profile-accent': customization.accentColor,
    '--profile-card-bg': customization.cardBackgroundColor,
    '--profile-card-text': customization.cardTextColor,
    '--profile-radius': `${customization.cardBorderRadius}rem`,
    '--profile-heading-font': `'${customization.headingFont}', sans-serif`,
    '--profile-body-font': `'${customization.bodyFont}', sans-serif`,
    '--profile-card-opacity': customization.cardOpacity.toString(),
  } as React.CSSProperties;

  const pageStyle: React.CSSProperties = {
    backgroundColor: customization.pageBackgroundImageUrl ? 'transparent' : 'var(--profile-bg)',
    color: 'var(--profile-text)',
    fontFamily: 'var(--profile-body-font)',
    minHeight: '100vh',
    position: 'relative',
    ...customStyles,
  };
  
  const ThemedCard = ({ children, className }: { children: ReactNode, className?: string }) => (
    <Card 
        className={cn("bg-[color:var(--profile-card-bg)] text-[color:var(--profile-card-text)] border-white/10 shadow-xl transition-all duration-300", className)}
        style={{ 
            borderRadius: 'var(--profile-radius)',
            backgroundColor: `rgba(from var(--profile-card-bg) r g b / var(--profile-card-opacity))`,
            backdropFilter: `blur(${ (1 - customization.cardOpacity) * 10 }px)`
        }}
    >
        {children}
    </Card>
  );

  const ThemedTabsContent = ({ value, children }: { value: string, children: ReactNode }) => (
    <TabsContent 
        value={value} 
        className="mt-0 p-4 md:p-6"
        style={{
            backgroundColor: `rgba(from var(--profile-card-bg) r g b / calc(var(--profile-card-opacity) * 0.8))`,
            borderBottomLeftRadius: 'var(--profile-radius)',
            borderBottomRightRadius: 'var(--profile-radius)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderTop: 'none',
        }}
    >
        {children}
    </TabsContent>
  );
  
  const EmptyState = ({ icon, message, actionButton }: { icon: ReactNode, message: string, actionButton?: ReactNode }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center text-[color:var(--profile-card-text)] opacity-70 bg-[color:var(--profile-card-bg)] bg-opacity-50 rounded-lg p-6"
         style={{ borderRadius: 'var(--profile-radius)' }}
    >
        {React.cloneElement(icon as React.ReactElement, { className: "h-12 w-12 mb-4 opacity-50" })}
        <p className="text-lg mb-4">{message}</p>
        {actionButton}
    </div>
  );


  return (
    <>
    <div style={pageStyle}>
        {customization.pageBackgroundImageUrl && (
            <Image src={customization.pageBackgroundImageUrl} alt={customization.pageBackgroundImageAiHint || "Profile page background"} fill style={{objectFit: 'cover'}} data-ai-hint={customization.pageBackgroundImageAiHint || 'decorative background'} className="absolute inset-0 z-0" priority />
        )}
      <div className="relative z-10">
        <div className="relative h-48 md:h-64 lg:h-80 w-full">
            <Image src={currentProfile.coverImageUrl} alt={`${currentProfile.name}'s cover image`} fill style={{objectFit: 'cover'}} data-ai-hint={currentProfile.coverImageAiHint || "abstract banner"} className="bg-muted" priority />
            <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="container mx-auto px-4 -mt-16 md:-mt-24 relative pb-12">
            <ThemedCard className="overflow-visible mb-8">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                <Avatar className="h-32 w-32 md:h-48 md:w-48 border-4 ring-2" style={{ borderColor: 'var(--profile-bg)', ringColor: 'var(--profile-accent)'}}>
                    <AvatarImage src={currentProfile.avatarUrl} alt={currentProfile.name} data-ai-hint={currentProfile.avatarAiHint || "profile portrait"} />
                    <AvatarFallback className="text-4xl">{currentProfile.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-grow text-center md:text-left mt-4 md:mt-0">
                    <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'var(--profile-heading-font)'}}>{currentProfile.name}</h1>
                    <p className="text-lg" style={{ color: 'var(--profile-accent)'}}>@{username}</p>
                    {currentProfile.creatorType && <p className="text-md font-semibold mt-1" style={{color: 'var(--profile-accent)'}}>{currentProfile.creatorType}</p>}
                    <p className="mt-2 max-w-xl mx-auto md:mx-0 opacity-90">{currentProfile.bio}</p>
                    {currentProfile.personalVibeTags && currentProfile.personalVibeTags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                        {currentProfile.personalVibeTags.map(tag => ( <Badge key={tag} variant="outline" className="text-xs" style={{borderColor: 'var(--profile-accent)', color: 'var(--profile-text)'}}> <Tag className="mr-1.5 h-3 w-3" style={{color: 'var(--profile-accent)'}} />{tag} </Badge> ))}
                    </div>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 mt-4 md:mt-0 self-center md:self-end">
                    {isOwner ? ( <Link href={`/profile/me/edit`}><Button variant="outline"><Edit3 className="mr-2 h-4 w-4" /> Edit Profile</Button></Link>
                    ) : ( 
                        <div className="flex items-center gap-1">
                            <Button variant="default"><UserPlus className="mr-2 h-4 w-4" /> Follow</Button>
                            <Button variant="outline" onClick={() => setIsChatOpen(true)}><MessageSquare className="mr-2 h-4 w-4" /> Message</Button>
                            <TipPopover recipientName={currentProfile.name} />
                            <Button variant="ghost" size="icon" onClick={() => setIsBlockDialogOpen(true)} className="text-muted-foreground hover:text-destructive">
                                <Ban className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setIsReportDialogOpen(true)} className="text-muted-foreground hover:text-destructive">
                                <ShieldAlert className="h-5 w-5" />
                            </Button>
                        </div>
                    )}
                </div>
                </div>
                <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4 md:gap-8 text-sm opacity-80 border-t border-white/10 pt-6">
                <span><strong>{userCreations.length}</strong> Creations</span>
                <span><strong>{currentProfile.stats.followers}</strong> Followers</span>
                <span><strong>{currentProfile.stats.following}</strong> Following</span>
                </div>
            </CardContent>
            </ThemedCard>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
                <div className="overflow-x-auto border-b border-white/10">
                    <Reorder.Group as="div" axis="x" values={orderedTabs} onReorder={isOwner ? handleTabReorder : () => {}} className="inline-flex h-auto items-center justify-start rounded-none bg-transparent p-0">
                    <TabsList className="p-0 bg-transparent flex-nowrap">
                        {orderedTabs.map((tab) => (
                        <Reorder.Item key={tab.id} value={tab} className={cn(isOwner ? "cursor-grab" : "cursor-default", "p-1 list-none")}>
                            <TabsTrigger value={tab.id} className="py-3 capitalize data-[state=active]:bg-[color:var(--profile-card-bg)] data-[state=active]:text-[color:var(--profile-accent)] data-[state=active]:shadow-md rounded-t-md rounded-b-none" style={{ borderTopLeftRadius: 'var(--profile-radius)', borderTopRightRadius: 'var(--profile-radius)', backgroundColor: activeTab === tab.id ? `rgba(from var(--profile-card-bg) r g b / var(--profile-card-opacity))` : 'transparent' }}>
                            {tab.label}
                            </TabsTrigger>
                        </Reorder.Item>
                        ))}
                    </TabsList>
                    </Reorder.Group>
                </div>
                
                <ThemedTabsContent value="creations">
                {userCreations.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {userCreations.map(creation => (
                        <Card key={creation.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow flex flex-col bg-[color:var(--profile-card-bg)] text-[color:var(--profile-card-text)]" style={{borderRadius: 'var(--profile-radius)'}}>
                        <Link href={`/creations/${creation.id}`} className="block group">
                            <div className="relative aspect-video bg-muted">
                            <Image src={creation.imageUrl} alt={creation.title} fill style={{objectFit: 'cover'}} data-ai-hint={creation.aiHint} className="group-hover:scale-105 transition-transform duration-300"/>
                            <div className="absolute top-2 right-2 p-1.5 rounded-full" style={{backgroundColor: `rgba(from var(--profile-card-bg) r g b / 0.8)`, color: 'var(--profile-accent)'}}>
                                {getIconForType(creation.type)}
                            </div>
                            </div>
                            <CardContent className="p-4 flex-grow">
                            <h3 className="text-lg font-semibold truncate" style={{fontFamily: 'var(--profile-heading-font)'}}>{creation.title}</h3>
                            <p className="text-sm font-medium" style={{color: 'var(--profile-accent)'}}>By {creation.authorProfileName || currentProfile.name}</p>
                            <p className="text-sm truncate mt-1 opacity-80">{creation.description}</p>
                            </CardContent>
                        </Link>
                        {isOwner && (
                            <CardFooter className="p-2 border-t" style={{borderColor: 'rgba(255,255,255,0.1)'}}> 
                                <div className="flex justify-end gap-2 w-full">
                                    <Button variant="ghost" size="sm" onClick={() => handleEditCreation(creation)} className="h-8 px-2 hover:bg-white/10"><Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit</Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild><Button variant="ghost" size="sm" className="h-8 px-2 text-destructive hover:text-destructive/90 hover:bg-destructive/10"><Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete</Button></AlertDialogTrigger>
                                        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete "{creation.title}".</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteCreation(creation.id, creation.title)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardFooter>
                        )}
                        </Card>
                    ))}
                    </div>
                ) : ( <EmptyState icon={<Layers />} message="No Echoes found in this sanctuary yet." actionButton={isOwner ? (<Link href="/upload"><Button variant="outline"><UploadCloud className="mr-2 h-4 w-4" /> Upload your first Echo</Button></Link>) : undefined}/> )}
                </ThemedTabsContent>

                <ThemedTabsContent value="about">
                    <ThemedCard className="shadow-lg p-6 space-y-8">
                        <div>
                            <h2 className="mb-4 flex items-center text-3xl" style={{fontFamily: 'var(--profile-heading-font)'}}><Info className="mr-3 h-7 w-7" style={{color: 'var(--profile-accent)'}}/> About {currentProfile.name.split(' ')[0]}</h2>
                            <Separator className="mb-6 opacity-20" />
                            {currentProfile.philosophy && (<div className="mb-8"><h3 className="text-xl font-semibold mb-3 flex items-center" style={{color: 'var(--profile-accent)'}}><Sparkles className="mr-2 h-5 w-5" /> Artistic Statement</h3><p className="whitespace-pre-line leading-relaxed opacity-90">{currentProfile.philosophy}</p></div>)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                            {currentProfile.keySkills && currentProfile.keySkills.length > 0 && (<div className="space-y-3"><h3 className="text-xl font-semibold flex items-center" style={{color: 'var(--profile-accent)'}}><Award className="mr-2 h-5 w-5" />Key Skills</h3><div className="flex flex-wrap gap-2">{currentProfile.keySkills.map(skill => (<Badge key={skill} variant="secondary">{skill}</Badge>))}</div></div>)}
                            {currentProfile.tools && currentProfile.tools.length > 0 && (<div className="space-y-3"><h3 className="text-xl font-semibold flex items-center" style={{color: 'var(--profile-accent)'}}><Briefcase className="mr-2 h-5 w-5" />Tools of Trade</h3><p className="opacity-90">{currentProfile.tools.join(', ')}.</p></div>)}
                            {currentProfile.influences && currentProfile.influences.length > 0 && (<div className="space-y-3"><h3 className="text-xl font-semibold flex items-center" style={{color: 'var(--profile-accent)'}}><Users2 className="mr-2 h-5 w-5" />Influences</h3><p className="opacity-90">{currentProfile.influences.join(', ')}.</p></div>)}
                            {currentProfile.website && (<div className="space-y-3"><h3 className="text-xl font-semibold flex items-center" style={{color: 'var(--profile-accent)'}}><LinkIcon className="mr-2 h-5 w-5" />Website</h3><Link href={currentProfile.website} target="_blank" rel="noopener noreferrer" className="hover:underline break-all" style={{color: 'var(--profile-text)'}}>{currentProfile.website}</Link></div>)}
                        </div>
                    </ThemedCard>
                </ThemedTabsContent>

                 <ThemedTabsContent value="moodboard">
                {(currentProfile.moodboardItems && currentProfile.moodboardItems.length > 0) ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {currentProfile.moodboardItems.map(item => (
                        <Card key={item.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow group bg-[color:var(--profile-card-bg)]" style={{borderRadius: 'var(--profile-radius)'}}>
                        <div className="relative aspect-square bg-muted"><Image src={item.imageUrl} alt={item.description || `Moodboard item ${item.id}`} fill style={{objectFit: 'cover'}} data-ai-hint={item.aiHint} className="group-hover:scale-105 transition-transform duration-300"/></div>
                        {item.description && (<div className="p-3"><p className="text-xs opacity-80 truncate" title={item.description}>{item.description}</p></div>)}
                        </Card>
                    ))}
                    </div>
                ) : ( <EmptyState icon={<LayoutDashboard />} message="This moodboard is waiting for inspiration." actionButton={isOwner ? (<Link href={`/profile/${username}/edit`}><Button variant="outline"><Sparkles className="mr-2 h-4 w-4" /> Add Relics to Moodboard</Button></Link>) : undefined}/> )}
                </ThemedTabsContent>
                <ThemedTabsContent value="shop">
                    {currentProfile.shopItems && currentProfile.shopItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {currentProfile.shopItems.map(item => (
                            <Card key={item.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow flex flex-col bg-[color:var(--profile-card-bg)] text-[color:var(--profile-card-text)]" style={{borderRadius: 'var(--profile-radius)'}}>
                            <div className="relative aspect-[3/2] bg-muted group"><Image src={item.imageUrl} alt={item.title} fill style={{objectFit: 'cover'}} data-ai-hint={item.aiHint} className="group-hover:scale-105 transition-transform duration-300"/></div>
                            <CardHeader className="p-4 pb-2"><CardTitle className="text-lg font-semibold truncate" style={{fontFamily: 'var(--profile-heading-font)'}}>{item.title}</CardTitle></CardHeader>
                            <CardContent className="p-4 pt-0 flex-grow"><p className="text-sm opacity-80">{item.description}</p></CardContent>
                            <CardFooter className="p-4 pt-0 mt-auto border-t" style={{borderColor: 'rgba(255,255,255,0.1)'}}>
                                <div className="flex justify-between items-center w-full">
                                    <p className="font-bold text-lg" style={{color: 'var(--profile-accent)'}}>{item.price}</p>
                                    <Button className="ml-auto" onClick={() => handleAddToCart(item.title)} style={{backgroundColor: 'var(--profile-accent)', color: 'var(--profile-bg)'}}><ShoppingBag className="mr-2 h-4 w-4" /> Add to Cart</Button>
                                </div>
                            </CardFooter>
                            </Card>
                        ))}
                    </div>
                    ) : ( <EmptyState icon={<ShoppingBag />} message="This shop is currently empty." actionButton={isOwner ? (<Link href={`/profile/me/edit`}><Button variant="outline"><Edit3 className="mr-2 h-4 w-4" /> Add Shop Items</Button></Link>) : undefined} /> )}
                </ThemedTabsContent>
                <ThemedTabsContent value="supporters">
                {(currentProfile.supporters && currentProfile.supporters.length > 0) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentProfile.supporters.map(supporter => (
                        <Card key={supporter.id} className="shadow-md hover:shadow-lg transition-shadow bg-[color:var(--profile-card-bg)]" style={{borderRadius: 'var(--profile-radius)'}}>
                            <CardContent className="p-4 flex items-center space-x-4">
                                <Avatar className="h-12 w-12 border-2" style={{borderColor: 'var(--profile-accent)'}}><AvatarImage src={supporter.avatar} alt={supporter.name} data-ai-hint="user avatar" /><AvatarFallback>{supporter.name.charAt(1).toUpperCase()}</AvatarFallback></Avatar>
                                <div className="flex-grow"><p className="font-semibold text-lg">{supporter.name}</p><p className="text-sm opacity-80">Pledged: ${supporter.amount.toFixed(2)}</p></div>
                                <Badge variant="secondary" style={{backgroundColor: 'var(--profile-accent)', color: 'var(--profile-bg)'}}>{supporter.tier}</Badge>
                            </CardContent>
                        </Card>
                    ))}
                    </div>
                ) : ( <EmptyState icon={<HeartHandshake />} message="No supporters to show yet." actionButton={!isOwner ? (<Button variant="outline"><Heart className="mr-2 h-4 w-4" /> Be the First to Support</Button>) : (<p className="text-sm opacity-70">Share your profile to gain supporters!</p>)}/>)}
                </ThemedTabsContent>
            </Tabs>
        </div>
      </div>
    </div>
    
    <ReportDialog 
      isOpen={isReportDialogOpen}
      onClose={() => setIsReportDialogOpen(false)}
      reportType="user"
      targetName={currentProfile.name}
      targetId={currentProfile.uid}
    />
    <AlertDialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Block @{currentProfile.usernameParam}?</AlertDialogTitle>
          <AlertDialogDescription>
            They will not be able to follow or message you, and you won't see their notifications.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isBlocking}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isBlocking}
            onClick={handleBlockUser}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isBlocking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Block User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {!isOwner && (
         <ChatDialog isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} recipient={{ id: currentProfile.usernameParam, name: currentProfile.name, usernameParam: currentProfile.usernameParam, avatarUrl: currentProfile.avatarUrl, avatarAiHint: currentProfile.avatarAiHint, creatorType: currentProfile.creatorType, bioShort: currentProfile.bio, } as Creator} />
    )}
    </>
  );
}
