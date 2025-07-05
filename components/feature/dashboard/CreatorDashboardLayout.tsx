
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  LayoutDashboard,
  Music,
  ImageIcon,
  Code2,
  Sparkles,
  CloudUpload,
  Palette,
  Settings,
  Radio,
  Users,
  BarChart2,
  Gift,
  MessageSquare,
  PenTool,
  Layers,
  Lightbulb,
  HelpCircle,
  DollarSign,
  HeartHandshake,
  UserPlus,
  Heart,
  Star,
  Wand2,
  GraduationCap,
  Mic2,
  Brain,
  Tag,
  Camera,
  CalendarCheck,
  Loader2,
} from 'lucide-react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { type Creation } from '@/config/profileData';
import { useUser } from '@/contexts/UserContext';
import { listenForNotifications } from '@/lib/firebase/firestoreService';
import { type NotificationData } from '@/config/notificationsData';
import { formatDistanceToNow } from 'date-fns';


interface NavItemProps {
  icon: ReactNode;
  label: string;
  tooltip: string;
  href: string;
  isActive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon, label, tooltip, href, isActive, disabled, onClick }: NavItemProps) => (
  <TooltipProvider delayDuration={0}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          className="w-full justify-start text-sm h-10"
          asChild
          onClick={onClick}
          disabled={disabled}
        >
          <Link href={href}>
            {icon}
            <span className="ml-3 truncate">{label}</span>
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" align="center" className="bg-popover text-popover-foreground">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);


const getCreationIcon = (type: Creation['type']) => {
    switch(type) {
        case 'Audio': return <Music className="h-5 w-5 text-pink-500" />;
        case 'Image': return <ImageIcon className="h-5 w-5 text-blue-500" />;
        case 'Code': return <Code2 className="h-5 w-5 text-green-500" />;
        case 'Writing': return <PenTool className="h-5 w-5 text-orange-500" />;
        default: return <Layers className="h-5 w-5 text-gray-500" />;
    }
};

const getActivityIcon = (type: NotificationData['type']) => {
  switch (type) {
    case 'comment': return <MessageSquare className="h-5 w-5 text-green-500" />;
    case 'follow': return <UserPlus className="h-5 w-5 text-blue-500" />;
    case 'like': return <Heart className="h-5 w-5 text-red-500" />;
    case 'sale': return <DollarSign className="h-5 w-5 text-yellow-500" />;
    case 'system': return <Sparkles className="h-5 w-5 text-purple-500" />;
    default: return <Sparkles className="h-5 w-5 text-gray-500" />;
  }
};

export function CreatorDashboardLayout() {
  const { userProfile, loading: isLoading } = useUser();
  const [activities, setActivities] = useState<NotificationData[]>([]);
  
  useEffect(() => {
    if (userProfile?.uid) {
      const unsubscribe = listenForNotifications(userProfile.uid, (newNotifications) => {
        setActivities(newNotifications);
      }, 7); // Limit to 7 recent activities for the dashboard
      return () => unsubscribe();
    }
  }, [userProfile]);

  const sidebarNavItems: NavItemProps[] = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard', tooltip: 'Overview of your creative universe.', href: '/dashboard', isActive: true },
    { icon: <Layers className="h-5 w-5" />, label: 'My Echoes', tooltip: "Browse and manage all your creations.", href: '/profile/me' },
    { icon: <Users className="h-5 w-5" />, label: 'AI Collab Finder', tooltip: 'Get AI-powered collaboration suggestions.', href: '/collaborate' },
    { icon: <GraduationCap className="h-5 w-5" />, label: 'Learning Paths', tooltip: 'Master new skills and explore creative domains.', href: '/learning' },
    { icon: <Sparkles className="h-5 w-5" />, label: 'AI Image Generator', tooltip: 'Generate images from text prompts.', href: '/image-generator' },
    { icon: <Camera className="h-5 w-5" />, label: 'AI Image Feedback', tooltip: 'Get AI feedback on your images.', href: '/image-enhancer' },
    { icon: <Mic2 className="h-5 w-5" />, label: 'AI Lyric Studio', tooltip: 'Generate song lyrics from a prompt.', href: '/lyric-studio' },
    { icon: <Brain className="h-5 w-5" />, label: 'AI Content Refinement', tooltip: 'Polish your creative text with AI suggestions.', href: '/content-refinement'},
    { icon: <Wand2 className="h-5 w-5" />, label: 'AI Portfolio Generator', tooltip: 'Generate a portfolio with AI.', href: '/portfolio-generator' },
    { icon: <Tag className="h-5 w-5" />, label: 'AI Vibe Tagging', tooltip: 'Get AI-suggested tags for your creations.', href: '/vibe-tagging' },
    { icon: <CalendarCheck className="h-5 w-5" />, label: 'AI Event Planner', tooltip: 'Get AI assistance planning your next community event.', href: '/event-planner' },
    { icon: <DollarSign className="h-5 w-5" />, label: 'Earnings', tooltip: 'Track your monetization and growth.', href: '/earnings' },
    { icon: <HeartHandshake className="h-5 w-5" />, label: 'Fan Investments', tooltip: 'Track and engage with your fan investors.', href: '/fan-investments' },
    { icon: <Palette className="h-5 w-5" />, label: 'Moodboard Manager', tooltip: 'Curate and remix saved moments into emotional collages.', href: '/profile/me/edit' },
    { icon: <Settings className="h-5 w-5" />, label: 'Room & Profile Settings', tooltip: 'Edit your profile and personal space.', href: '/profile/me/edit' },
    { icon: <Radio className="h-5 w-5" />, label: 'Stream Integration', tooltip: 'Link your live energy into the platform.', href: '/stream-settings' },
    { icon: <BarChart2 className="h-5 w-5" />, label: 'Analytics & Impact', tooltip: 'Visualize resonance. See what’s been heard, seen, and felt.', href: '#', disabled: true },
    { icon: <Gift className="h-5 w-5" />, label: 'Supporters & Tips', tooltip: 'Meet those who believe in your work. Offer perks, set tip goals.', href: '/fan-investments' },
  ];

  if (isLoading) {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-4 text-muted-foreground">Loading Dashboard...</span>
        </div>
    );
  }
  
  const recentEchoes = userProfile?.creations.slice(0, 3) || [];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-64 border-r bg-card p-4 space-y-2 hidden md:flex flex-col">
        <div className="p-2 mb-2">
          <h2 className="text-xl font-semibold font-headline text-primary flex items-center">
            <Sparkles className="h-6 w-6 mr-2" /> Creator Hub
          </h2>
        </div>
        <ScrollArea className="flex-grow">
          <nav className="space-y-1">
            {sidebarNavItems.map((item) => (
              <NavItem key={item.label} {...item} />
            ))}
          </nav>
        </ScrollArea>
        <div className="mt-auto p-2 border-t">
            <Button variant="outline" className="w-full" disabled>
                <HelpCircle className="h-4 w-4 mr-2" /> Help & Support
            </Button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold font-headline">Dashboard Home</h1>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                 <Link href="/upload">
                    <Button size="lg">
                    <CloudUpload className="mr-2 h-5 w-5" /> Upload New Echo
                    </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent className="bg-popover text-popover-foreground">
                <p>Upload sound, video, image, or text — anything that leaves a trace.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Echoes</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProfile?.creations.length || 0}</div>
              <p className="text-xs text-muted-foreground">Your body of work</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Followers</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProfile?.stats.followers.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">+85 this week (mock)</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Supporters</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProfile?.supporters?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Your dedicated fans</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tips Received</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(userProfile?.stats.totalTipsReceived || 0).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From your community</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Creator Level</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Level {userProfile?.stats.level || 1}</div>
              <p className="text-xs text-muted-foreground">
                {100 - (userProfile?.stats.xp || 0)} XP to next level
              </p>
              <Progress value={userProfile?.stats.xp || 0} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </section>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                    <Lightbulb className="mr-2 h-6 w-6 text-primary" /> Recent Echoes
                </h2>
                 {recentEchoes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentEchoes.map((echo) => (
                        <Card key={echo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <Link href={`/creations/${echo.id}`} className="block">
                                <div className="p-4 bg-muted/30 flex items-center justify-center h-32">
                                    <div className="p-3 bg-background rounded-full shadow-md">
                                        {getCreationIcon(echo.type)}
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                <h3 className="text-lg font-semibold truncate">{echo.title}</h3>
                                <p className="text-sm text-muted-foreground">Type: {echo.type}{echo.mood && ` | Mood: ${echo.mood}`}</p>
                                </CardContent>
                            </Link>
                            <CardFooter className="p-4 border-t flex justify-end gap-2">
                            <Link href={`/upload?edit=true&creationId=${echo.id}`}><Button variant="outline" size="sm"><PenTool className="mr-2 h-4 w-4"/>Edit</Button></Link>
                            <Button variant="ghost" size="sm" disabled><BarChart2 className="mr-2 h-4 w-4"/>Stats</Button>
                            </CardFooter>
                        </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground col-span-full text-center py-4">No echoes uploaded yet. Start creating!</p>
                )}
            </div>
            
            <div className="lg:col-span-1">
                 <h2 className="text-2xl font-semibold mb-6">Recent Activity</h2>
                 <Card>
                    <CardContent className="p-4">
                        <ScrollArea className="h-96">
                            <div className="space-y-4">
                                {activities.length > 0 ? activities.map(activity => (
                                    <div key={activity.id} className="flex items-center space-x-4">
                                        <div className="p-2 bg-muted rounded-full">
                                            {getActivityIcon(activity.type)}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="text-sm font-medium">{activity.message}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                 </Card>
            </div>
        </div>

      </main>
    </div>
  );
}
