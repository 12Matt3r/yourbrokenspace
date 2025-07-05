
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { type Guild, type GuildPost } from '@/config/guildData';
import { useUser } from '@/contexts/UserContext';
import { getGuildById, getGuildPosts } from '@/lib/firebase/firestoreService';
import { addPostAction } from './actions';
import { Palette, Music, Code, PenTool, Gamepad2, Sparkles, Users, MessageSquare, Send, UserPlus, LogOut, Rss, AlertTriangle, Loader2 } from 'lucide-react';

function GuildIcon({ iconName, className }: { iconName: Guild['icon'], className?: string }) {
    const props = { className: className || "h-8 w-8 text-primary" };
    switch (iconName) {
        case 'Palette': return <Palette {...props} />;
        case 'Music': return <Music {...props} />;
        case 'Code': return <Code {...props} />;
        case 'PenTool': return <PenTool {...props} />;
        case 'Gamepad2': return <Gamepad2 {...props} />;
        case 'Sparkles': return <Sparkles {...props} />;
        case 'Users': return <Users {...props} />;
        default: return <Users {...props} />;
    }
}

export default function GuildDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();

    const [guild, setGuild] = useState<Guild | null>(null);
    const [posts, setPosts] = useState<GuildPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    const { userProfile } = useUser();
    const currentUserIsMember = guild?.memberIds?.includes(userProfile?.uid || '') || false;

    useEffect(() => {
        if (!id) return;
        const fetchGuildData = async () => {
            setIsLoading(true);
            try {
                const [guildData, postsData] = await Promise.all([
                    getGuildById(id),
                    getGuildPosts(id)
                ]);

                if (guildData) {
                    setGuild(guildData);
                    setPosts(postsData);
                } else {
                    toast({ variant: 'destructive', title: 'Guild not found.' });
                }
            } catch (error) {
                console.error("Failed to fetch guild data:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load guild data.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchGuildData();
    }, [id, toast]);
    
    const handlePostSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent.trim() || !userProfile) return;
        
        setIsPosting(true);

        const result = await addPostAction(id, {
            authorId: userProfile.uid,
            authorName: userProfile.name,
            authorUsername: userProfile.usernameParam,
            authorAvatarUrl: userProfile.avatarUrl,
            authorAvatarAiHint: userProfile.avatarAiHint,
            content: newPostContent,
        });

        if (result.success) {
            setNewPostContent('');
            // Optimistically add post, or refetch
            const newPosts = await getGuildPosts(id);
            setPosts(newPosts);
            toast({ title: "Post Submitted!", description: "Your message has been added to the guild feed." });
        } else {
            toast({ variant: 'destructive', title: "Failed to post", description: result.error });
        }
        setIsPosting(false);
    };

    if (isLoading) {
        return (
            <PageWrapper className="py-12 flex justify-center items-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </PageWrapper>
        );
    }
    
    if (!guild) {
        return (
            <PageWrapper className="py-12">
                <Card className="max-w-md mx-auto shadow-lg border-destructive">
                <CardHeader className="bg-destructive/10 text-center">
                    <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
                    <CardTitle className="text-2xl text-destructive-foreground">Guild Not Found</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground mb-6">Sorry, the guild you're looking for doesn't exist.</p>
                    <Link href="/guilds"><Button variant="outline">Back to Guilds</Button></Link>
                </CardContent>
                </Card>
            </PageWrapper>
        );
    }
    
    return (
        <>
            {/* Guild Header */}
            <div className="relative h-48 md:h-64 w-full">
                <Image
                    src={guild.coverImageUrl}
                    alt={`${guild.name} cover image`}
                    fill
                    style={{objectFit: 'cover'}}
                    data-ai-hint={guild.coverImageAiHint}
                    className="bg-muted"
                    priority
                />
                <div className="absolute inset-0 bg-black/60" />
                <div className="absolute inset-0 flex items-center justify-center text-center text-white p-4">
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-black/50 rounded-full border-2 border-white/30">
                           <GuildIcon iconName={guild.icon} className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold font-headline drop-shadow-lg">{guild.name}</h1>
                        <p className="max-w-2xl text-lg text-slate-300 drop-shadow-md">{guild.description}</p>
                    </div>
                </div>
            </div>

            <PageWrapper className="py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Content: Post Feed */}
                    <main className="lg:col-span-3 space-y-6">
                        {currentUserIsMember && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center"><MessageSquare className="mr-2 h-5 w-5"/>New Post</CardTitle>
                                </CardHeader>
                                <form onSubmit={handlePostSubmit}>
                                    <CardContent>
                                        <Textarea
                                            placeholder="Share your thoughts with the guild..."
                                            value={newPostContent}
                                            onChange={(e) => setNewPostContent(e.target.value)}
                                            className="min-h-[100px]"
                                            disabled={isPosting}
                                        />
                                    </CardContent>
                                    <CardFooter className="flex justify-end">
                                        <Button type="submit" disabled={!newPostContent.trim() || isPosting}>
                                            {isPosting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                                            {isPosting ? 'Posting...' : 'Post to Guild'}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        )}
                        
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold font-headline flex items-center"><Rss className="mr-3 h-6 w-6 text-primary"/>Guild Feed</h2>
                            {posts.map(post => (
                                <Card key={post.id} className="shadow-sm">
                                    <CardContent className="p-4 flex items-start gap-4">
                                        <Link href={`/profile/${post.authorUsername}`}>
                                            <Avatar className="h-10 w-10 border">
                                                <AvatarImage src={post.authorAvatarUrl} alt={post.authorName} data-ai-hint={post.authorAvatarAiHint || 'user avatar'} />
                                                <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </Link>
                                        <div className="flex-grow">
                                            <div className="flex items-baseline justify-between">
                                                <Link href={`/profile/${post.authorUsername}`}>
                                                    <span className="font-semibold text-foreground hover:underline">{post.authorName}</span>
                                                </Link>
                                                <span className="text-xs text-muted-foreground">{formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true })}</span>
                                            </div>
                                            <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{post.content}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </main>

                    {/* Sidebar: Members & Actions */}
                    <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 h-fit">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5"/>Members ({guild.members.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-64 pr-3">
                                <div className="space-y-4">
                                    {guild.members.map(member => (
                                        <Link key={member.uid} href={`/profile/${member.username}`} className="flex items-center gap-3 group">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint={member.avatarAiHint || 'user avatar'} />
                                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium group-hover:text-primary transition-colors">{member.name}</p>
                                                <p className="text-xs text-muted-foreground">{member.creatorType}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                </ScrollArea>
                            </CardContent>
                            <CardFooter className="border-t pt-4">
                                {currentUserIsMember ? (
                                    <Button variant="destructive" className="w-full"><LogOut className="mr-2 h-4 w-4"/>Leave Guild (Soon)</Button>
                                ) : (
                                    <Button className="w-full"><UserPlus className="mr-2 h-4 w-4"/>Join Guild (Soon)</Button>
                                )}
                            </CardFooter>
                        </Card>
                    </aside>
                </div>
            </PageWrapper>
        </>
    );
}
