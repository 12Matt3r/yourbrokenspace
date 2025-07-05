
import type { Timestamp } from 'firebase/firestore';

export interface Creator {
  id: string; // Corresponds to UserProfileData['uid']
  name: string;
  usernameParam: string;
  avatarUrl?: string;
  avatarAiHint?: string;
  creatorType: string;
  bioShort: string;
  availableForMentorship?: boolean;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date | Timestamp;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantInfo: {
    [key: string]: {
        name: string;
        avatarUrl?: string;
        usernameParam: string;
    }
  };
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: Timestamp;
  }
  createdAt: Timestamp;
}
