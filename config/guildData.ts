
import type { Timestamp } from 'firebase/firestore';

// Represents a denormalized member object stored in the Guild document
export interface GuildMember {
  uid: string;
  name: string;
  username: string;
  avatarUrl?: string;
  avatarAiHint?: string;
  creatorType: string;
}

// Represents a post within the 'posts' subcollection of a Guild
export interface GuildPost {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl?: string;
  authorAvatarAiHint?: string;
  content: string;
  createdAt: Timestamp;
}

// Represents the main Guild document
export interface Guild {
  id: string;
  name:string;
  description: string;
  coverImageUrl: string;
  coverImageAiHint: string;
  icon: 'Palette' | 'Music' | 'Code' | 'PenTool' | 'Gamepad2' | 'Sparkles' | 'Users';
  members: GuildMember[]; // For quick display of members
  memberIds: string[]; // For rules and querying
  createdAt?: Timestamp;
}
