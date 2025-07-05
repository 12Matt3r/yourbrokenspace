import { z } from 'zod';
import type { LyricsGeneratorOutput } from '@/ai/flows/lyrics-generator-flow';

export const LyricsThemeSchema = z.enum(['love', 'heartbreak', 'rebellion', 'nostalgia', 'adventure', 'social_commentary', 'introspection']);
export const LyricsGenreSchema = z.enum(['pop', 'rock', 'hip-hop', 'country', 'folk', 'electronic', 'r&b']);

export const LyricsGeneratorFormSchema = z.object({
  theme: LyricsThemeSchema,
  genre: LyricsGenreSchema,
  keywords: z.string()
    .min(3, { message: 'Please provide at least one keyword.' })
    .max(100, { message: 'Keywords field must be at most 100 characters long.' }),
});

export type LyricsGeneratorFormData = z.infer<typeof LyricsGeneratorFormSchema>;

export type LyricsGeneratorFormState = {
  message: string | null;
  fields?: Partial<LyricsGeneratorFormData>;
  issues?: string[];
  fieldErrors?: Partial<Record<keyof LyricsGeneratorFormData, string[]>>;
  data?: LyricsGeneratorOutput;
};
