
'use client';

import type { ReactNode } from 'react';
import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Users, Zap, ShieldCheck, Star, CheckCircle, Gem, Rocket, Sparkles as SparkIcon } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SubscriptionTier {
  id: string;
  name: string;
  price: string;
  icon: ReactNode;
  benefits: string[];
  isCurrentPlan?: boolean;
  ctaText: string;
  bestValue?: boolean;
}

const platformTiers: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free Explorer',
    price: '$0/month',
    icon: <Star className="h-7 w-7 text-muted-foreground" />,
    benefits: [
      'Basic room customization',
      'Upload up to 3 Echoes (creations)',
      'Access public Mentor AI prompts',
      'Standard community access',
      'Limited Spark Token earning',
    ],
    ctaText: 'Start Exploring',
    isCurrentPlan: false,
  },
  {
    id: 'creator',
    name: 'Creator Hub',
    price: '$9/month',
    icon: <Gem className="h-7 w-7 text-primary" />, // Use primary color
    benefits: [
      'Full monetization tools (tips, merch integration)',
      'Advanced room customization',
      'Upload up to 50 Echoes',
      'Full Mentor AI access (200 interactions/month)',
      'Deeper analytics on your content',
      'Bonus Spark Tokens monthly',
      'Exclusive Creator badge',
      'Early access to new features',
    ],
    ctaText: 'Choose Creator',
    isCurrentPlan: true, 
    bestValue: true,
  },
  {
    id: 'studio',
    name: 'Studio Grid',
    price: '$25/month',
    icon: <Rocket className="h-7 w-7 text-accent" />, // Use accent color
    benefits: [
      'All Creator Hub benefits',
      'Unlimited Echo uploads',
      'Team-based access (up to 3 users)',
      'AI Co-Creation Suite (e.g., music mastering assist)',
      'Priority support & discovery',
      'Exclusive Studio badge & flair',
      'Advanced collaboration tracking',
      'Largest Spark Token monthly bonus',
    ],
    ctaText: 'Go Pro Studio',
  },
];

const currentPlanId = 'creator'; 
platformTiers.forEach(tier => {
  tier.isCurrentPlan = tier.id === currentPlanId;
  if (tier.isCurrentPlan) {
    tier.ctaText = 'Your Current Plan';
  }
});

const currentActivePlan = platformTiers.find(tier => tier.isCurrentPlan) || platformTiers[0];


export default function SubscriptionsPage() {
  const { toast } = useToast();

  const handleChoosePlan = (tierName: string) => {
    toast({
      title: 'Plan Changed (Mock)',
      description: `You've selected the ${tierName} plan. This is a mock action.`,
    });
  };

  return (
    <PageWrapper className="py-12">
      <header className="mb-12 text-center">
        <DollarSign className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-5xl font-bold font-headline text-foreground">Subscriptions & Support</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Manage your YourSpace plan, support creators, and unlock the full potential of the platform.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <Card className="shadow-xl overflow-hidden border-border lg:col-span-1">
          <CardHeader className="bg-card/50 p-6">
            <div className="flex items-center">
              <ShieldCheck className="h-8 w-8 mr-3 text-primary" />
              <CardTitle className="text-3xl font-headline text-foreground">Your Plan</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-2xl font-semibold text-primary">{currentActivePlan.name}</h3>
            <p className="text-lg font-bold">{currentActivePlan.price}</p>
            <ul className="space-y-1.5 text-muted-foreground">
              {currentActivePlan.benefits.slice(0, 4).map((benefit, index) => (
                <li key={index} className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500 shrink-0" />
                  {benefit}
                </li>
              ))}
              {currentActivePlan.benefits.length > 4 && <li className="text-sm text-muted-foreground/70">+ {currentActivePlan.benefits.length - 4} more benefits</li>}
            </ul>
            <p className="text-sm text-muted-foreground">Next billing date: November 28, 2024 (placeholder)</p>
            <Button variant="outline" className="w-full mt-2" disabled>Manage Subscription (Soon)</Button>
          </CardContent>
        </Card>

        <Card className="shadow-xl overflow-hidden border-border lg:col-span-2">
          <CardHeader className="bg-card/50 p-6">
            <div className="flex items-center">
              <Zap className="h-8 w-8 mr-3 text-primary" />
              <CardTitle className="text-3xl font-headline text-foreground">Platform Tiers & Rewards</CardTitle>
            </div>
            <CardDescription className="text-md text-muted-foreground">
              Choose the tier that best fits your creative journey and ambitions. Unlock more features, monetization tools, and Spark Tokens!
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {platformTiers.map((tier) => (
                <Card 
                  key={tier.id} 
                  className={cn(
                    "flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 border-2",
                    tier.isCurrentPlan ? "border-primary ring-2 ring-primary" : "border-border",
                    tier.bestValue && !tier.isCurrentPlan && "border-accent ring-2 ring-accent"
                  )}
                >
                  <CardHeader className="items-center text-center p-4 relative">
                    {tier.bestValue && !tier.isCurrentPlan && (
                        <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-semibold px-2 py-1 rounded-bl-md rounded-tr-md">
                            Best Value
                        </div>
                    )}
                    <div className="p-3 bg-muted rounded-full mb-2">
                         {tier.icon}
                    </div>
                    <CardTitle className="text-xl font-semibold">{tier.name}</CardTitle>
                    <p className="text-2xl font-bold text-foreground">{tier.price.split('/')[0]}</p>
                    <p className="text-xs text-muted-foreground">/month</p>
                  </CardHeader>
                  <CardContent className="flex-grow p-4 pt-0">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {tier.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="p-4 mt-auto">
                    <Button
                      onClick={() => handleChoosePlan(tier.name)}
                      disabled={tier.isCurrentPlan}
                      variant={tier.isCurrentPlan ? "outline" : (tier.bestValue ? "default" : "secondary")}
                      className="w-full"
                    >
                      {tier.ctaText}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
             <div className="mt-8 p-4 border border-dashed rounded-md bg-muted/30 text-center">
                <h4 className="text-lg font-semibold mb-2 text-foreground flex items-center justify-center">
                  <SparkIcon className="h-5 w-5 mr-2 text-yellow-500"/> Spark Tokens & Room Upgrades
                </h4>
                <p className="text-muted-foreground text-sm">
                  Higher tiers grant more Spark Tokens! Use them to enhance your rooms, tip creators, or unlock exclusive content. Room Upgrade Marketplace coming soon!
                </p>
            </div>
          </CardContent>
        </Card>
        
         <Card className="shadow-xl overflow-hidden border-border lg:col-span-1">
          <CardHeader className="bg-card/50 p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 mr-3 text-primary" />
              <CardTitle className="text-3xl font-headline text-foreground">Support Creators</CardTitle>
            </div>
             <CardDescription className="text-md text-muted-foreground">
              Discover and subscribe to creators for exclusive content and perks.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-4">
              Find your favorite artists, musicians, and developers. Many offer supporter tiers with unique rewards, early access, and direct interaction.
            </p>
            <Link href="/creators">
                <Button variant="secondary" className="w-full">Find Creators to Support</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
