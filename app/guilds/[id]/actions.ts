
'use server';

import { addPostToGuild } from '@/lib/firebase/firestoreService';
import { revalidatePath } from 'next/cache';

// A simplified version of the GuildPost type for creation
interface NewPostData {
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl?: string;
  authorAvatarAiHint?: string;
  content: string;
}

export async function addPostAction(guildId: string, postData: NewPostData): Promise<{ success: boolean; error?: string }> {
  if (!postData.content.trim()) {
    return { success: false, error: "Post content cannot be empty." };
  }
  if (!postData.authorId) {
      return { success: false, error: "User is not authenticated." };
  }

  try {
    await addPostToGuild(guildId, postData);
    revalidatePath(`/guilds/${guildId}`);
    return { success: true };
  } catch (error) {
    console.error("Error adding post to guild:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}
