
import type { ReactNode } from 'react';

export interface FanContributionData {
  date: string;
  amount: number;
}

export interface TopSupporter {
  id: string;
  name: string;
  avatar: string;
  amount: number;
  tier: string;
}

export interface ProjectGoal {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
}

export interface RewardTier {
    id: string;
    title: string;
    price: string;
    description: string;
    icon: 'Star' | 'Gem' | 'Rocket';
}

// This type is no longer needed as the component uses live NotificationData
// export interface FanActivity {
//     id: string;
//     type: 'New Supporter' | 'Contribution' | 'Milestone Unlocked' | 'Comment';
//     supporterName: string;
//     details: string;
//     timestamp: string;
//     amount?: number;
// }

export const fanContributionData: FanContributionData[] = [
  { date: 'Jun 1', amount: 150 },
  { date: 'Jun 4', amount: 180 },
  { date: 'Jun 7', amount: 250 },
  { date: 'Jun 10', amount: 220 },
  { date: 'Jun 13', amount: 300 },
  { date: 'Jun 16', amount: 320 },
  { date: 'Jun 19', amount: 290 },
  { date: 'Jun 22', amount: 380 },
  { date: 'Jun 25', amount: 450 },
  { date: 'Jun 28', amount: 410 },
  { date: 'Jul 1', amount: 500 },
];

export const topSupporters: TopSupporter[] = [
  { id: 'sup1', name: '@VibeCollector', avatar: 'https://placehold.co/40x40.png', amount: 250, tier: 'Diamond' },
  { id: 'sup2', name: '@ArtFanatic', avatar: 'https://placehold.co/40x40.png', amount: 175, tier: 'Gold' },
  { id: 'sup3', name: '@SynthLover_22', avatar: 'https://placehold.co/40x40.png', amount: 150, tier: 'Gold' },
  { id: 'sup4', name: '@TruePatron', avatar: 'https://placehold.co/40x40.png', amount: 95, tier: 'Silver' },
];

export const projectGoals: ProjectGoal[] = [
  {
    id: 'proj1',
    title: 'Next Album Production',
    description: 'Funding for studio time, mixing, and mastering for the upcoming album "Digital Dreams".',
    current: 7500,
    target: 10000,
  },
  {
    id: 'proj2',
    title: 'Interactive Music Video',
    description: 'Create a WebGL-based interactive music video for the lead single.',
    current: 1200,
    target: 5000,
  },
];

export const rewardTiers: RewardTier[] = [
    {
        id: 'tier1',
        title: 'Silver Supporter',
        price: '$5',
        description: 'Get early access to new music and behind-the-scenes content.',
        icon: 'Star',
    },
    {
        id: 'tier2',
        title: 'Gold Fan',
        price: '$15',
        description: 'All Silver benefits plus your name in the credits and exclusive merch discounts.',
        icon: 'Gem',
    },
    {
        id: 'tier3',
        title: 'Diamond Patron',
        price: '$50',
        description: 'All Gold benefits plus a signed vinyl and a personal thank-you video.',
        icon: 'Rocket',
    },
];

// The recentFanActivity mock data has been removed, as the component now uses live notification data from Firestore.
// export const recentFanActivity: FanActivity[] = [ ... ];
    
