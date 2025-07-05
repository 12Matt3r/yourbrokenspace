
import type { ReactNode } from 'react';
import type { Timestamp } from 'firebase/firestore';
import type { YourSpaceEvent } from './eventsData';

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl?: string;
  authorAvatarAiHint?: string;
  text: string;
  createdAt: Timestamp;
}

export interface Creation {
  id: string;
  authorId: string;
  type: 'Image' | 'Audio' | 'Code' | 'Game' | 'Video' | 'Writing';
  title: string;
  author: string;
  authorProfileName?: string; 
  imageUrl: string; 
  aiHint: string; 
  externalUrl?: string; 
  description: string; 
  longDescription?: string; 
  gameSrc?: string; 
  gameWidth?: number; 
  gameHeight?: number; 
  tags?: string[];
  mood?: string;
  rating?: number;
  featured?: boolean;
  remixOf?: {
    id: string;
    title: string;
    author: string;
  };
  createdAt?: Timestamp;
}


export interface ShopItem {
  id: string;
  title: string;
  price: string;
  imageUrl: string;
  aiHint: string;
  description: string;
}

export interface MoodboardItem {
  id: string;
  imageUrl: string;
  aiHint: string;
  description?: string;
}

export interface Supporter {
  id: string;
  name: string;
  avatar: string;
  amount: number;
  tier: string;
}

export interface ProfileCustomization {
  pageBackgroundColor: string;
  pageTextColor: string;
  accentColor: string;
  cardBackgroundColor: string;
  cardTextColor: string;
  headingFont: string;
  bodyFont: string;
  cardBorderRadius: number; // 0 to 2 (rem)
  cardOpacity: number; // 0 to 1
  pageBackgroundImageUrl: string | null;
  pageBackgroundImageAiHint?: string;
  tabOrder?: string[];
}

export interface UserProfileData {
  uid: string;
  name: string;
  usernameParam: string;
  creatorType: string;
  specialization: string;
  flairTitle: string;
  personalVibeTags: string[];
  bio: string;
  avatarUrl: string;
  avatarAiHint?: string;
  coverImageUrl: string;
  coverImageAiHint?: string;
  website: string;
  keySkills: string[];
  influences: string[];
  tools: string[];
  philosophy: string;
  availableForMentorship: boolean;
  blockedUsers?: string[];
  stats: {
    creations: number;
    followers: number;
    following: number;
    level: number;
    xp: number;
    totalTipsReceived?: number;
    totalTipsSent?: number;
  };
  following: string[]; // List of UIDs the user follows
  followers: string[]; // List of UIDs following this user
  creations: Creation[]; // This will be populated from Firestore now
  shopItems: ShopItem[];
  moodboardItems: MoodboardItem[];
  supporters: Supporter[];
  customization: ProfileCustomization;
  email?: string;
  createdAt?: Timestamp;
  lastLogin?: Timestamp;
}

export const baseUserProfile: Omit<UserProfileData, 'uid' | 'email' | 'createdAt' | 'lastLogin'> = {
  name: 'Creative User',
  usernameParam: 'me',
  creatorType: 'Digital Artist',
  specialization: 'Exploring New Mediums',
  flairTitle: 'Idea Weaver',
  personalVibeTags: ['Retro', 'Chill', 'Experimental', 'Abstract'],
  bio: 'Exploring the intersection of technology and art, one creation at a time.',
  avatarUrl: 'https://placehold.co/200x200.png',
  avatarAiHint: 'profile avatar',
  coverImageUrl: 'https://placehold.co/1200x400.png',
  coverImageAiHint: 'abstract digital art',
  website: 'https://example.com/my-portfolio',
  keySkills: ['Digital Painting', 'Music Production', 'Creative Coding'],
  influences: ['Vaporwave Aesthetics', 'Classic Sci-Fi', 'Indie Games'],
  tools: ['Photoshop', 'Ableton Live', 'p5.js'],
  philosophy: "I believe creativity is a journey of exploration, not a destination. My work is about capturing fleeting moments of inspiration and turning them into digital artifacts. I\'m passionate about blending different mediums to create new forms of expression.",
  availableForMentorship: true,
  blockedUsers: [],
  following: [],
  followers: [],
  stats: {
    creations: 0, 
    followers: 0,
    following: 0,
    level: 1,
    xp: 0,
    totalTipsReceived: 0,
    totalTipsSent: 0,
  },
  creations: [],
  shopItems: [],
  supporters: [],
  moodboardItems: [],
  customization: {
    pageBackgroundColor: '#121212',
    pageTextColor: '#E0E0E0',
    accentColor: '#BB86FC',
    cardBackgroundColor: '#1E1E1E',
    cardTextColor: '#E0E0E0',
    headingFont: 'Space Grotesk',
    bodyFont: 'Space Grotesk',
    cardBorderRadius: 0.75,
    cardOpacity: 0.8,
    pageBackgroundImageUrl: null,
    pageBackgroundImageAiHint: 'abstract background',
    tabOrder: ['creations', 'moodboard', 'shop', 'supporters', 'about'],
  }
};
