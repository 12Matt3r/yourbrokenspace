
import type { Timestamp } from 'firebase/firestore';

export interface NotificationData {
  id: string;
  type: 'comment' | 'follow' | 'like' | 'sale' | 'system';
  read: boolean;
  timestamp: Timestamp;
  title: string;
  message: string;
  link: string; // e.g., /creations/abc#comment-123
  avatarUrl?: string;
  avatarAiHint?: string;
}

// Mock data is no longer used by the application,
// but is kept here for reference or future testing purposes.
export const mockNotifications: Omit<NotificationData, 'timestamp'>[] = [
  {
    id: 'notif-1',
    type: 'comment',
    read: false,
    title: 'New Comment',
    message: '@SynthLover_22 commented on your track "City Groove".',
    link: '/creations/music-1#comments',
    avatarUrl: 'https://placehold.co/40x40.png',
    avatarAiHint: 'user avatar music',
  },
  // ... other mock notifications
];
