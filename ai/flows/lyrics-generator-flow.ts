
'use server';
/**
 * @fileOverview An AI agent that generates song lyrics based on user input.
 *
 * - generateLyrics - A function that handles the lyric generation process.
 * - LyricsGeneratorInput - The input type for the generateLyrics function.
 * - LyricsGeneratorOutput - The return type for the generateLyrics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { LyricsGenreSchema, LyricsThemeSchema } from '@/app/lyric-studio/schemas';

const LyricsGeneratorInputSchema = z.object({
  theme: LyricsThemeSchema,
  genre: LyricsGenreSchema,
  keywords: z.string().max(100, "Keywords must be at most 100 characters.").describe("A comma-separated list of keywords to inspire the lyrics."),
});
export type LyricsGeneratorInput = z.infer<typeof LyricsGeneratorInputSchema>;

const LyricsGeneratorOutputSchema = z.object({
  lyrics: z.string().describe("The full generated song lyrics, including markers like [Verse 1], [Chorus], etc."),
  titleSuggestion: z.string().describe("A plausible title for the generated song."),
});
export type LyricsGeneratorOutput = z.infer<typeof LyricsGeneratorOutputSchema>;

export async function generateLyrics(input: LyricsGeneratorInput): Promise<LyricsGeneratorOutput> {
  return lyricsGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'lyricsGeneratorPrompt',
  input: {schema: LyricsGeneratorInputSchema},
  output: {schema: LyricsGeneratorOutputSchema},
  prompt: `You are an expert songwriter and creative muse. Your task is to write a complete song with structured lyrics based on the user's specifications.

The song should have a clear structure, typically including verses, a chorus, and a bridge.
The lyrics must be original, creative, and evocative, reflecting the provided theme, genre, and keywords.
Finally, suggest a creative and fitting title for the song.

**User's Song Request:**
-   **Theme/Mood:** {{{theme}}}
-   **Genre:** {{{genre}}}
-   **Inspiring Keywords:** {{{keywords}}}

---
Generate the song lyrics now. Ensure the output is well-formatted and adheres to the requested schema.
`,
});

const lyricsGeneratorFlow = ai.defineFlow(
  {
    name: 'lyricsGeneratorFlow',
    inputSchema: LyricsGeneratorInputSchema,
    outputSchema: LyricsGeneratorOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error('AI did not return any lyrics. Please try adjusting your prompt.');
    }
    return output;
  }
);
