'use server';

import { generateLyrics, type LyricsGeneratorInput } from '@/ai/flows/lyrics-generator-flow';
import type { LyricsGeneratorFormState } from './schemas';
import { LyricsGeneratorFormSchema } from './schemas';

export async function getLyricsAction(
  prevState: LyricsGeneratorFormState,
  formData: FormData
): Promise<LyricsGeneratorFormState> {
  
  const rawFormData = {
    theme: formData.get('theme'),
    genre: formData.get('genre'),
    keywords: formData.get('keywords'),
  };

  const validatedFields = LyricsGeneratorFormSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      message: 'Validation failed. Please check your inputs.',
      issues: validatedFields.error.flatten().formErrors,
      fieldErrors: validatedFields.error.flatten().fieldErrors,
      fields: rawFormData,
      data: undefined,
    };
  }

  const inputData: LyricsGeneratorInput = validatedFields.data;

  try {
    const result = await generateLyrics(inputData);
    return {
      message: 'Successfully generated lyrics!',
      data: result,
      issues: undefined,
      fieldErrors: undefined,
      fields: undefined, // Clear fields on success
    };
  } catch (error) {
    console.error('Error in lyricsGeneratorFlow:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while generating suggestions.';
    return {
      message: 'An error occurred. Please try again.',
      data: undefined,
      issues: [errorMessage],
      fieldErrors: undefined,
      fields: inputData, // Keep fields populated on error
    };
  }
}
