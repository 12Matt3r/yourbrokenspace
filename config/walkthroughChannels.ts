
import type { ComponentType } from 'react';
import { IntroductionChannel } from '@/components/feature/walkthrough/channels/IntroductionChannel';
import { UserOnboardingChannel } from '@/components/feature/walkthrough/channels/UserOnboardingChannel';
import { ContentUploadChannel } from '@/components/feature/walkthrough/channels/ContentUploadChannel';
import { CollaborationChannel } from '@/components/feature/walkthrough/channels/CollaborationChannel';
import { NoiseExplorerChannel } from '@/components/feature/walkthrough/channels/NoiseExplorerChannel';
// Import other channel components here as they are created

export interface WalkthroughChannel {
  title: string;
  component: ComponentType<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  description?: string;
}

export const walkthroughChannels: WalkthroughChannel[] = [
  {
    title: 'Introduction',
    component: IntroductionChannel,
    description: 'Welcome to YourSpace. Discover our vision.',
  },
  {
    title: 'Sanctuary Setup',
    component: UserOnboardingChannel,
    description: 'Craft your personal creative space.',
  },
  {
    title: 'Content Upload',
    component: ContentUploadChannel,
    description: 'Share your masterpieces with the world.',
  },
  {
    title: 'AI Collaboration',
    component: CollaborationChannel,
    description: 'Discover collaborators with AI-powered suggestions.',
  },
  {
    title: 'Featured Hubs',
    component: NoiseExplorerChannel,
    description: 'Explore curated creative communities.',
  }
];
