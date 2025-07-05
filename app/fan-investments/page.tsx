
'use client';

import * as React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';

import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUser } from '@/contexts/UserContext';
import { listenForNotifications } from '@/lib/firebase/firestoreService';
import { type NotificationData } from '@/config/notificationsData';
import { formatDistanceToNow } from 'date-fns';

import {
  Users,
  DollarSign,
  TrendingUp,
  Award,
  HeartHandshake,
  MessageSquare,
  Gift,
  PlusCircle,
  Star,
  Rocket,
  Gem,
  UserPlus,
  Heart,
  Sparkles,
} from 'lucide-react';

import {
  fanContributionData,
  topSupporters,
  projectGoals,
  rewardTiers,
  type RewardTier,
} from '@/config/fanInvestmentData';


function StatCard({ title, value, icon, prefix = '', suffix = '', details, colorClass = 'text-primary' }: { title: string; value: number; icon: React.ReactNode; prefix?: string; suffix?: string; details: string; colorClass?: string; }) {
  return (
    <Card className="shadow-lg transition-transform hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {React.cloneElement(icon as React.ReactElement, { className: `h-4 w-4 text-muted-foreground` })}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colorClass}`}>
          <CountUp start={0} end={value} duration={2.5} separator="," prefix={prefix} suffix={suffix} decimals={prefix === '$' ? 2 : 0} />
        </div>
        <p className="text-xs text-muted-foreground">{details}</p>
      </CardContent>
    </Card>
  );
}

const getActivityIcon = (type: NotificationData['type']) => {
    switch(type) {
        case 'follow': return <UserPlus className="h-5 w-5 text-green-500" />;
        case 'sale': return <DollarSign className="h-5 w-5 text-blue-500" />;
        case 'like': return <Heart className="h-5 w-5 text-red-500" />;
        case 'system': return <Sparkles className="h-5 w-5 text-purple-500" />;
        case 'comment': return <MessageSquare className="h-5 w-5 text-gray-500" />;
        default: return <HeartHandshake className="h-5 w-5 text-pink-500" />;
    }
}

const getTierIcon = (iconName: RewardTier['icon']) => {
    switch(iconName) {
        case 'Star': return <Star className="h-6 w-6 text-yellow-400" />;
        case 'Gem': return <Gem className="h-6 w-6 text-primary" />;
        case 'Rocket': return <Rocket className="h-6 w-6 text-accent" />;
        default: return <Award className="h-6 w-6" />;
    }
}

const chartConfig = {
  amount: { label: 'Amount', color: 'hsl(var(--primary))' },
};


export default function FanInvestmentPage() {
  const { userProfile } = useUser();
  const [activities, setActivities] = React.useState<NotificationData[]>([]);

  React.useEffect(() => {
    if (userProfile?.uid) {
      const unsubscribe = listenForNotifications(userProfile.uid, (newNotifications) => {
        setActivities(newNotifications);
      }, 7);
      return () => unsubscribe();
    }
  }, [userProfile]);

  return (
    <TooltipProvider>
      <PageWrapper className="py-8 bg-muted/20">
        <header className="mb-8">
          <h1 className="text-4xl font-bold font-headline text-foreground flex items-center">
            <HeartHandshake className="mr-4 h-10 w-10 text-primary" /> Fan Investment Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">Track your community's engagement and support for your projects.</p>
        </header>

        {/* Stat Cards Section */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard title="Total Supporters" value={userProfile?.stats?.followers || 0} icon={<Users />} details="Your follower count" colorClass="text-accent" />
          <StatCard title="Total Pledged (mock)" value={4875.50} prefix="$" icon={<DollarSign />} details="Avg. $26.50 per supporter" colorClass="text-primary" />
          <StatCard title="Engagement Score (mock)" value={8.7} suffix="/10" icon={<TrendingUp />} details="Rising this week" colorClass="text-green-500" />
          <StatCard title="Rewards Distributed (mock)" value={321} icon={<Gift />} details="Next distribution in 5 days" />
        </section>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Chart & Activity */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-foreground">Contribution Timeline (mock data)</CardTitle>
                <CardDescription className="text-muted-foreground">Fan contributions over the last 30 days.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer>
                    <AreaChart data={fanContributionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                       <defs>
                        <linearGradient id="colorContributions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartConfig.amount.color} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={chartConfig.amount.color} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))"/>
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`}/>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 'var(--radius)',
                          color: 'hsl(var(--card-foreground))'
                        }}
                      />
                      <Area type="monotone" dataKey="amount" stroke={chartConfig.amount.color} fillOpacity={1} fill="url(#colorContributions)" strokeWidth={2}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-foreground">Recent Fan Activity</CardTitle>
                <CardDescription className="text-muted-foreground">Latest notifications from your community.</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="space-y-4">
                    {activities.length > 0 ? (
                      activities.map((activity) => (
                          <div key={activity.id} className="flex items-center space-x-4">
                              <div className="p-2 bg-muted rounded-full">
                                  {getActivityIcon(activity.type)}
                              </div>
                              <div className="flex-grow">
                                  <p className="text-sm font-medium text-foreground">
                                      {activity.message}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true })}
                                  </p>
                              </div>
                          </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No recent activity to show.</p>
                    )}
                 </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Goals & Supporters */}
          <div className="space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-foreground">Project Funding Goals (mock)</CardTitle>
                <CardDescription className="text-muted-foreground">Your progress towards community-funded projects.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {projectGoals.map(goal => (
                  <div key={goal.id}>
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-sm font-medium text-foreground">{goal.title}</span>
                      <span className="text-xs text-muted-foreground">
                        <CountUp end={goal.current} prefix="$" separator=","/> / <CountUp end={goal.target} prefix="$" separator=","/>
                      </span>
                    </div>
                    <UITooltip>
                        <TooltipTrigger className="w-full">
                            <Progress value={(goal.current / goal.target) * 100} className="h-3" indicatorClassName="bg-gradient-to-r from-accent to-primary" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-popover text-popover-foreground">
                            <p>{goal.description}</p>
                        </TooltipContent>
                    </UITooltip>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                 <Button variant="outline" className="w-full">
                   <PlusCircle className="mr-2 h-4 w-4"/> Set New Funding Goal
                 </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-lg">
               <CardHeader>
                <CardTitle className="text-foreground">Top Supporters (mock)</CardTitle>
                <CardDescription className="text-muted-foreground">This would be populated with real data in a full integration.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 {topSupporters.map(supporter => (
                    <div key={supporter.id} className="flex items-center space-x-3">
                        <Avatar>
                            <AvatarImage src={supporter.avatar} alt={supporter.name} data-ai-hint="user avatar" />
                            <AvatarFallback>{supporter.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                            <p className="font-semibold text-sm text-foreground">{supporter.name}</p>
                            <p className="text-xs text-muted-foreground">Pledged: ${supporter.amount.toFixed(2)}</p>
                        </div>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{supporter.tier}</Badge>
                    </div>
                 ))}
              </CardContent>
              <CardFooter className="flex-col gap-2">
                 <Button>Send Appreciation</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        {/* Reward Tiers Section */}
        <section className="mt-8">
            <h2 className="text-2xl font-bold font-headline text-foreground mb-4">Your Reward Tiers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {rewardTiers.map(tier => (
                    <Card key={tier.id} className="shadow-lg flex flex-col">
                        <CardHeader className="text-center">
                            <div className="mx-auto bg-muted p-3 rounded-full w-fit mb-2 text-primary">
                                {getTierIcon(tier.icon)}
                            </div>
                            <CardTitle className="text-xl text-foreground">{tier.title}</CardTitle>
                            <CardDescription className="font-bold text-lg text-primary">{tier.price}/month</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-sm text-center text-muted-foreground">{tier.description}</p>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full">Manage Tier</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </section>

      </PageWrapper>
    </TooltipProvider>
  );
}

    
