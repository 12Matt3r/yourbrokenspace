
export interface RevenueData {
  date: string;
  sales: number;
  subscriptions: number;
  tips: number;
}

export interface Goal {
  id: string;
  title: string;
  current: number;
  target: number;
}

export interface Transaction {
  id: string;
  type: 'Sale' | 'Subscription' | 'Tip';
  description: string;
  amount: number;
}

export const earningsData: RevenueData[] = [
  { date: 'Jun 1', sales: 45, subscriptions: 20, tips: 5 },
  { date: 'Jun 4', sales: 50, subscriptions: 22, tips: 8 },
  { date: 'Jun 7', sales: 60, subscriptions: 25, tips: 12 },
  { date: 'Jun 10', sales: 55, subscriptions: 24, tips: 10 },
  { date: 'Jun 13', sales: 70, subscriptions: 28, tips: 15 },
  { date: 'Jun 16', sales: 80, subscriptions: 30, tips: 20 },
  { date: 'Jun 19', sales: 75, subscriptions: 32, tips: 18 },
  { date: 'Jun 22', sales: 90, subscriptions: 35, tips: 25 },
  { date: 'Jun 25', sales: 110, subscriptions: 40, tips: 30 },
  { date: 'Jun 28', sales: 100, subscriptions: 38, tips: 28 },
  { date: 'Jul 1', sales: 120, subscriptions: 45, tips: 35 },
];

export const goals: Goal[] = [
  {
    id: 'g1',
    title: 'New Studio Microphone',
    current: 350,
    target: 500,
  },
  {
    id: 'g2',
    title: 'Upgrade Synthesizer',
    current: 850,
    target: 1500,
  },
    {
    id: 'g3',
    title: 'Art Tablet Upgrade',
    current: 150,
    target: 800,
  },
];

export const recentTransactions: Transaction[] = [
  { id: 't1', type: 'Sale', description: '"Neon Dreams" Art Print', amount: 45.00 },
  { id: 't2', type: 'Subscription', description: 'New Tier 2 Subscriber: @ArtFanatic', amount: 10.00 },
  { id: 't3', type: 'Tip', description: 'Tip from @MusicLover_99', amount: 5.00 },
  { id: 't4', type: 'Sale', description: 'Synth Preset Pack Vol. 2', amount: 25.00 },
  { id: 't5', type: 'Sale', description: '"Cosmic Echoes" Album Download', amount: 15.00 },
];
