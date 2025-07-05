
'use server';

import { aiPoweredVibeTagging, type AiPoweredVibeTaggingInput } from '@/ai/flows/ai-powered-vibe-tagging';
import type { VibeTaggingFormState } from './schemas';
import { VibeTaggingFormSchema, type VibeTaggingFormData } from './schemas';


export async function getVibeTagsAction(
  prevState: VibeTaggingFormState,
  formData: FormData
): Promise<VibeTaggingFormState> {
  const rawFormData = {
    assetDescription: formData.get('assetDescription'),
    assetType: formData.get('assetType'),
    communityTrends: formData.get('communityTrends'),
  };
  const validatedFields = VibeTaggingFormSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    const formIssues = validatedFields.error.issues.map((issue) => issue.message);
    
    return {
      message: 'Validation failed. Please check your inputs.',
      issues: formIssues,
      fieldErrors,
      fields: { // Ensure fields are returned as VibeTaggingFormData
        assetDescription: formData.get('assetDescription')?.toString() ?? '',
        assetType: formData.get('assetType')?.toString() as VibeTaggingFormData['assetType'] ?? 'image', // Provide a default or ensure type
        communityTrends: formData.get('communityTrends')?.toString() ?? '',
      },
      data: undefined,
    };
  }

  const inputData: AiPoweredVibeTaggingInput = validatedFields.data;

  try {
    const result = await aiPoweredVibeTagging(inputData);
    return {
      message: 'Successfully generated vibe tags!',
      data: result,
      issues: undefined,
      fieldErrors: undefined,
      fields: undefined, // Clear fields on success
    };
  } catch (error) {
    console.error('Error in aiPoweredVibeTagging:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while generating tags.';
    return {
      message: 'An error occurred. Please try again.',
      data: undefined,
      issues: [errorMessage],
      fieldErrors: undefined,
      fields: inputData, // Keep fields populated on error
    };
  }
}
