'use server';

import { getAllCreations } from '@/lib/firebase/firestoreService';
import type { Creation } from '@/config/profileData';
import { generateDjCommentary, type DjCommentaryInput } from '@/ai/flows/dj-commentary-flow';
import { textToSpeech } from '@/ai/flows/tts-flow';

export async function getRadioTracks(): Promise<Creation[]> {
  try {
    const allCreations = await getAllCreations();
    return allCreations.filter(c => c.type === 'Audio' && c.externalUrl);
  } catch (error) {
    console.error("Failed to fetch radio tracks:", error);
    return [];
  }
}

interface DjAudioResult {
  audioDataUri?: string;
  error?: string;
}

export async function getDjCommentaryAction(input: DjCommentaryInput): Promise<DjAudioResult> {
    try {
        const commentaryResult = await generateDjCommentary(input);
        if (commentaryResult.error) {
            return { error: commentaryResult.error };
        }
        
        const ttsResult = await textToSpeech(commentaryResult.commentary!);
        if ('error' in ttsResult) {
            return { error: ttsResult.error };
        }

        return { audioDataUri: ttsResult.media };
    } catch(error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        console.error("DJ Commentary Action Error:", error);
        return { error: errorMessage };
    }
}
