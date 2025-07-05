
import type { Timestamp } from 'firebase/firestore';

export interface YourSpaceEvent {
  id: string;
  hostId: string;
  title: string;
  hostName: string;
  hostUsername: string;
  date: string; // ISO format string
  type: 'Livestream Q&A' | 'Virtual Gallery' | 'Listening Party' | 'Workshop';
  description: string;
  coverImageUrl: string;
  coverImageAiHint: string;
  tags: string[];
  platform: 'YourSpace Live' | 'YouTube' | 'Twitch';
  platformUrl?: string;
  rsvps: number;
  createdAt?: Timestamp;
}
