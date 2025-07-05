
'use server';

import { generatePortfolio, type PortfolioGeneratorInput } from '@/ai/flows/portfolio-generator-flow';
import { PortfolioFormSchema, type PortfolioFormState } from './schemas';

export async function generatePortfolioAction(
  prevState: PortfolioFormState,
  formData: FormData
): Promise<PortfolioFormState> {
  const rawFormData = {
    artisticStyle: formData.get('artisticStyle'),
    preferences: formData.get('preferences'),
    template: formData.get('template'),
    workSamples: JSON.parse(formData.get('workSamples') as string || '[]'),
  };

  const validatedFields = PortfolioFormSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten());
    return {
      message: 'Validation failed. Please check your inputs.',
      issues: validatedFields.error.flatten().formErrors,
      fieldErrors: validatedFields.error.flatten().fieldErrors,
      fields: rawFormData,
      data: undefined,
    };
  }

  const inputData: PortfolioGeneratorInput = validatedFields.data;

  try {
    const result = await generatePortfolio(inputData);
    return {
      message: 'Successfully generated portfolio layout!',
      data: result,
      issues: undefined,
      fieldErrors: undefined,
      fields: undefined,
    };
  } catch (error) {
    console.error('Error in generatePortfolio flow:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown AI error occurred.';
    return {
      message: 'An AI error occurred. Please try again.',
      data: undefined,
      issues: [errorMessage],
      fieldErrors: undefined,
      fields: inputData,
    };
  }
}
