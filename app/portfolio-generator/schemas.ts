
import { z } from 'zod';
import type { PortfolioGeneratorOutput } from '@/ai/flows/portfolio-generator-flow';

export const WorkSampleSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().url(),
});
export type WorkSample = z.infer<typeof WorkSampleSchema>;

export const PortfolioFormSchema = z.object({
  artisticStyle: z.string().min(10, "Please describe your artistic style in at least 10 characters."),
  preferences: z.string().optional(),
  template: z.enum(['minimalist', 'grid', 'dynamic']),
  workSamples: z.array(WorkSampleSchema).min(1, "Please add at least one work sample."),
});

export type PortfolioFormData = z.infer<typeof PortfolioFormSchema>;

export type PortfolioFormState = {
  message: string | null;
  fields?: Partial<PortfolioFormData>;
  issues?: string[];
  fieldErrors?: Partial<Record<keyof PortfolioFormData, string[]>>;
  data?: PortfolioGeneratorOutput;
};
