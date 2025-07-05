
'use server';
/**
 * @fileOverview An AI agent that suggests relevant tags and emotive classifications for creative assets.
 *
 * - aiPoweredVibeTagging - A function that handles the tag suggestion process.
 * - AiPoweredVibeTaggingInput - The input type for the aiPoweredVibeTagging function.
 * - AiPoweredVibeTaggingOutput - The return type for the aiPoweredVibeTagging function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPoweredVibeTaggingInputSchema = z.object({
  assetDescription: z.string().describe('The description of the creative asset.'),
  assetType: z.enum(['image', 'audio', 'video', 'text']).describe('The type of the creative asset.'),
  communityTrends: z.string().optional().describe('Relevant community trends or themes.'),
});
export type AiPoweredVibeTaggingInput = z.infer<typeof AiPoweredVibeTaggingInputSchema>;

const AiPoweredVibeTaggingOutputSchema = z.object({
  suggestedTags: z.array(z.string()).describe('The suggested tags for the creative asset.'),
  emotiveClassifications: z.array(z.string()).describe('The emotive classifications for the creative asset.'),
});
export type AiPoweredVibeTaggingOutput = z.infer<typeof AiPoweredVibeTaggingOutputSchema>;

export async function aiPoweredVibeTagging(input: AiPoweredVibeTaggingInput): Promise<AiPoweredVibeTaggingOutput> {
  return aiPoweredVibeTaggingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPoweredVibeTaggingPrompt',
  input: {schema: AiPoweredVibeTaggingInputSchema},
  output: {schema: AiPoweredVibeTaggingOutputSchema},
  prompt: `You are an AI assistant that suggests tags and emotive classifications for creative assets.

  Given the description of the asset and the asset type, suggest relevant tags and emotive classifications for the asset.
  If community trends are provided, use them to further refine the suggestions.

  Asset Description: {{{assetDescription}}}
  Asset Type: {{{assetType}}}
  {{#if communityTrends}}
  Community Trends: {{{communityTrends}}}
  {{/if}}

  Produce a diverse list of suggested tags and emotive classifications.
  `,
});

const aiPoweredVibeTaggingFlow = ai.defineFlow(
  {
    name: 'aiPoweredVibeTaggingFlow',
    inputSchema: AiPoweredVibeTaggingInputSchema,
    outputSchema: AiPoweredVibeTaggingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
