
import { z } from 'zod';
import type { ContentRefinementOutput } from '@/ai/flows/content-refinement-flow';

// Define and export shared schemas and types here
export const ContentTypeSchema = z.enum(['story_excerpt', 'artwork_description', 'song_lyrics', 'project_summary']);
export type ContentType = z.infer<typeof ContentTypeSchema>;

export const AnalysisGoalSchema = z.enum(['improve_clarity', 'suggest_titles', 'keyword_optimization', 'tone_adjustment']);
export type AnalysisGoal = z.infer<typeof AnalysisGoalSchema>;

// Form-specific schema
export const ContentRefinementFormSchema = z.object({
  contentText: z.string()
    .min(50, { message: 'Content text must be at least 50 characters long.' })
    .max(5000, { message: 'Content text must be at most 5000 characters long (Genkit context limit).' }),
  contentType: ContentTypeSchema.default('story_excerpt'),
  analysisGoals: z.array(AnalysisGoalSchema)
    .min(1, { message: 'Please select at least one analysis goal.' })
});

export type ContentRefinementFormData = z.infer<typeof ContentRefinementFormSchema>;

export type ContentRefinementFormState = {
  message: string | null;
  fields?: ContentRefinementFormData;
  issues?: string[];
  fieldErrors?: Partial<Record<keyof ContentRefinementFormData, string[]>>;
  data?: ContentRefinementOutput;
};
