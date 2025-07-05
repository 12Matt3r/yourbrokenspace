
'use server';

import { textToSpeech } from '@/ai/flows/tts-flow';
import { addCommentToCreation } from '@/lib/firebase/firestoreService';
import type { UserProfileData } from '@/config/profileData';

export async function narrateTextAction(text: string): Promise<{media: string} | {error: string}> {
  if (!text || text.trim().length < 10) {
      return { error: 'Text is too short to narrate.' };
  }
  
  try {
    const result = await textToSpeech(text);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during narration.';
    console.error("Narration error:", errorMessage);
    return { error: errorMessage };
  }
}

type CommentAuthorInfo = Pick<UserProfileData, 'uid' | 'name' | 'usernameParam' | 'avatarUrl' | 'avatarAiHint'>;

export async function addCommentAction(
  creationId: string,
  commentText: string,
  author: CommentAuthorInfo
): Promise<{ success: boolean; error?: string }> {
  if (!commentText.trim()) {
    return { success: false, error: "Comment can't be empty." };
  }
  if (!author.uid) {
    return { success: false, error: "User not authenticated." };
  }

  try {
    const commentData = {
      authorId: author.uid,
      authorName: author.name,
      authorUsername: author.usernameParam,
      authorAvatarUrl: author.avatarUrl,
      authorAvatarAiHint: author.avatarAiHint,
      text: commentText,
    };
    await addCommentToCreation(creationId, commentData);
    return { success: true };
  } catch (error) {
    console.error("Failed to add comment:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}
