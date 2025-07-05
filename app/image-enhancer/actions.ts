
'use server';

import { z } from 'zod';
import { getImageFeedback, type ImageEnhancementInput, type ImageEnhancementOutput } from '@/ai/flows/image-enhancement-flow';

const ImageFeedbackFormSchema = z.object({
    imageDataUri: z.string().min(1, { message: 'Please upload an image.' }),
    description: z.string().min(10, { message: 'Please provide a description or goal (at least 10 characters).' }),
    analysisGoals: z.array(z.enum(['composition', 'color', 'style'])).min(1, { message: 'Please select at least one analysis goal.' }),
});

export interface ImageFeedbackState {
    message: string | null;
    data?: ImageEnhancementOutput;
    error?: string;
    fieldErrors?: { 
        imageDataUri?: string[], 
        description?: string[], 
        analysisGoals?: string[] 
    };
    fields?: {
        description?: string;
        analysisGoals?: ('composition' | 'color' | 'style')[];
    };
}

export async function getImageFeedbackAction(
    prevState: ImageFeedbackState,
    formData: FormData
): Promise<ImageFeedbackState> {
    const validatedFields = ImageFeedbackFormSchema.safeParse({
        imageDataUri: formData.get('imageDataUri'),
        description: formData.get('description'),
        analysisGoals: formData.getAll('analysisGoals'),
    });
    
    if (!validatedFields.success) {
        return {
            message: 'Validation failed.',
            error: validatedFields.error.flatten().formErrors.join(', '),
            fieldErrors: validatedFields.error.flatten().fieldErrors,
            fields: {
                description: formData.get('description')?.toString(),
                analysisGoals: formData.getAll('analysisGoals') as ('composition' | 'color' | 'style')[],
            },
        };
    }
    
    const input: ImageEnhancementInput = {
        imageDataUri: validatedFields.data.imageDataUri,
        description: validatedFields.data.description,
        analysisGoals: validatedFields.data.analysisGoals,
    };

    try {
        const result = await getImageFeedback(input);
        return {
            message: 'Feedback generated successfully!',
            data: result,
        };
    } catch (error) {
        console.error('Error in imageEnhancementFlow:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown AI error occurred.';
        return {
            message: 'An error occurred during image analysis.',
            error: errorMessage,
            fields: {
                description: input.description,
                analysisGoals: input.analysisGoals,
            },
        };
    }
}
