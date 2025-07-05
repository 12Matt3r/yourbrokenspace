
import { z } from 'zod';
import type { AiPoweredVibeTaggingOutput } from '@/ai/flows/ai-powered-vibe-tagging';

export const AssetTypeSchema = z.enum(['image', 'audio', 'video', 'text']);

export const VibeTaggingFormSchema = z.object({
  assetDescription: z.string().min(10, { message: 'Asset description must be at least 10 characters long.' }).max(1000, { message: 'Asset description must be at most 1000 characters long.' }),
  assetType: AssetTypeSchema,
  communityTrends: z.string().max(200, { message: 'Community trends must be at most 200 characters long.' }).optional(),
});

export type VibeTaggingFormData = z.infer<typeof VibeTaggingFormSchema>;

export type VibeTaggingFormState = {
  message: string | null;
  fields?: VibeTaggingFormData; 
  issues?: string[]; 
  fieldErrors?: Partial<Record<keyof VibeTaggingFormData, string[]>>; 
  data?: AiPoweredVibeTaggingOutput;
};
