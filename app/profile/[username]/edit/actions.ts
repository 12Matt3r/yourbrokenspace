'use server';

import { z } from 'zod';
import { generateTheme, type ThemeGeneratorInput, type ThemeGeneratorOutput } from '@/ai/flows/theme-generator-flow';

const ThemeGeneratorFormSchema = z.object({
    prompt: z.string().min(10, { message: 'Prompt must be at least 10 characters.' }).max(200, { message: 'Prompt must be at most 200 characters.' }),
});

export interface AIThemeGeneratorState {
    message: string | null;
    error?: string;
    fieldErrors?: { prompt?: string[] };
    fields?: { prompt: string };
    data?: ThemeGeneratorOutput;
}

export async function generateThemeAction(
    prompt: string
): Promise<AIThemeGeneratorState> {
    const validatedFields = ThemeGeneratorFormSchema.safeParse({
        prompt: prompt,
    });
    
    if (!validatedFields.success) {
        return {
            message: 'Validation failed.',
            error: validatedFields.error.flatten().formErrors.join(', '),
            fieldErrors: validatedFields.error.flatten().fieldErrors,
            fields: {
                prompt: prompt,
            },
        };
    }
    
    const input: ThemeGeneratorInput = { prompt: validatedFields.data.prompt };

    try {
        const result = await generateTheme(input);
        return {
            message: 'Theme generated successfully!',
            data: result,
        };
    } catch (error) {
        console.error('Error in themeGeneratorFlow:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown AI error occurred.';
        return {
            message: 'An error occurred during theme generation.',
            error: errorMessage,
            fields: input,
        };
    }
}
