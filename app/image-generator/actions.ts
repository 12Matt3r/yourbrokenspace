
'use server';

import { generateImage, type ImageGeneratorInput } from '@/ai/flows/image-generator-flow';
import { z } from 'zod';

const ImageGeneratorFormSchema = z.object({
    prompt: z.string().min(3, { message: 'Prompt must be at least 3 characters.' }).max(1000, { message: 'Prompt must be at most 1000 characters.' }),
});

export interface ImageGeneratorState {
    message: string | null;
    imageDataUri?: string;
    error?: string;
    fieldErrors?: { prompt?: string[] };
    fields?: { prompt: string };
}

export async function generateImageAction(
    prevState: ImageGeneratorState,
    formData: FormData
): Promise<ImageGeneratorState> {
    const validatedFields = ImageGeneratorFormSchema.safeParse({
        prompt: formData.get('prompt'),
    });
    
    if (!validatedFields.success) {
        return {
            message: 'Validation failed.',
            error: validatedFields.error.flatten().formErrors.join(', '),
            fieldErrors: validatedFields.error.flatten().fieldErrors,
            fields: {
                prompt: formData.get('prompt')?.toString() ?? '',
            },
        };
    }
    
    const input: ImageGeneratorInput = { prompt: validatedFields.data.prompt };

    try {
        const result = await generateImage(input);
        return {
            message: 'Image generated successfully!',
            imageDataUri: result.imageDataUri,
        };
    } catch (error) {
        console.error('Error in imageGeneratorFlow:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown AI error occurred.';
        return {
            message: 'An error occurred during image generation.',
            error: errorMessage,
            fields: input,
        };
    }
}
