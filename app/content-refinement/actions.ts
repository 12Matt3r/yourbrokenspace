
'use server';

import { refineContent, type ContentRefinementInput } from '@/ai/flows/content-refinement-flow';
import type { ContentRefinementFormState } from './schemas';
import { ContentRefinementFormSchema } from './schemas';

export async function getContentRefinementAction(
  prevState: ContentRefinementFormState,
  formData: FormData
): Promise<ContentRefinementFormState> {
  
  const analysisGoals = formData.getAll('analysisGoals') as ContentRefinementInput['analysisGoals'];

  const rawFormData = {
    contentText: formData.get('contentText'),
    contentType: formData.get('contentType'),
    analysisGoals: analysisGoals,
  };

  const validatedFields = ContentRefinementFormSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    const formIssues = validatedFields.error.issues.map((issue) => issue.message);
    
    return {
      message: 'Validation failed. Please check your inputs.',
      issues: formIssues,
      fieldErrors,
      fields: {
        contentText: formData.get('contentText')?.toString() ?? '',
        contentType: formData.get('contentType')?.toString() as ContentRefinementInput['contentType'] ?? 'story_excerpt',
        analysisGoals: analysisGoals.length > 0 ? analysisGoals : [],
      },
      data: undefined,
    };
  }

  const inputData: ContentRefinementInput = validatedFields.data;

  try {
    const result = await refineContent(inputData);
    return {
      message: 'Successfully generated content refinement suggestions!',
      data: result,
      issues: undefined,
      fieldErrors: undefined,
      fields: undefined, // Clear fields on success
    };
  } catch (error) {
    console.error('Error in contentRefinementFlow:', error);
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
