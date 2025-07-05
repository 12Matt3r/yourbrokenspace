'use server';
/**
 * @fileOverview An AI agent that generates DJ commentary for a radio-style broadcast.
 *
 * - generateDjCommentary - Generates a commentary script between two songs.
 * - DjCommentaryInput - Input for the commentary generation.
 * - DjCommentaryOutput - Output of the commentary generation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const DjCommentaryInputSchema = z.object({
  previousTrack: z.object({
    title: z.string(),
    author: z.string(),
  }).optional().describe("Information about the track that just finished playing."),
  nextTrack: z.object({
    title: z.string(),
    author: z.string(),
  }).describe("Information about the track that is about to play."),
});
export type DjCommentaryInput = z.infer<typeof DjCommentaryInputSchema>;

export const DjCommentaryOutputSchema = z.object({
  commentary: z.string().describe("The DJ's commentary script. It should be brief, engaging, and sound like a real radio DJ. It should transition from the previous track to the next one smoothly."),
  error: z.string().optional(),
});
export type DjCommentaryOutput = z.infer<typeof DjCommentaryOutputSchema>;

export async function generateDjCommentary(input: DjCommentaryInput): Promise<DjCommentaryOutput> {
  return djCommentaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'djCommentaryPrompt',
  input: { schema: DjCommentaryInputSchema },
  output: { schema: DjCommentaryOutputSchema },
  prompt: `You are "Synthwave Sorceress," an AI DJ for 'YourSpace Radio', a platform for independent creators. Your personality is cool, knowledgeable, and slightly enigmatic. You love electronic music and champion indie artists.

Your task is to create a short, natural-sounding voice-over script to be used between songs.

{{#if previousTrack}}
The track that just finished was "{{previousTrack.title}}" by the talented {{previousTrack.author}}.
{{/if}}

The next track coming up is "{{nextTrack.title}}" by {{nextTrack.author}}.

Keep your commentary concise (1-3 sentences). Sound like a real DJ on an underground or indie radio station. You can mention the vibe of the previous track or build anticipation for the next one. Don't be overly robotic.

Example phrases:
- "And that was the ethereal sound of..."
- "Up next, we've got a banger from..."
- "Hope you enjoyed that one. Now, get ready for this..."
- "You're tuned into YourSpace Radio, the frequency for creative minds. Coming up next is..."

Generate the commentary now.
`,
});

const djCommentaryFlow = ai.defineFlow(
  {
    name: 'djCommentaryFlow',
    inputSchema: DjCommentaryInputSchema,
    outputSchema: DjCommentaryOutputSchema,
  },
  async (input) => {
    try {
        const { output } = await prompt(input);
        if (!output || !output.commentary) {
            throw new Error('AI did not return any commentary.');
        }
        return { commentary: output.commentary };
    } catch(e) {
        const error = e as Error;
        return { commentary: '', error: error.message };
    }
  }
);
