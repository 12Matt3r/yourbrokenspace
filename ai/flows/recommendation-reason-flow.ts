
'use server';
/**
 * @fileOverview An AI agent that generates a personalized reason for recommending content.
 *
 * - getRecommendationReason - A function that handles generating the reason.
 * - RecommendationReasonInput - The input type for the function.
 * - RecommendationReasonOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendationReasonInputSchema = z.object({
  userInterests: z.array(z.string()).describe("A list of the user's creative interests, preferred themes, or vibes."),
  userSkills: z.array(z.string()).describe("A list of the user's primary skills."),
  creationTitle: z.string().describe("The title of the content being recommended."),
  creationType: z.string().describe("The type of content (e.g., 'Image', 'Audio', 'Game')."),
  creationTags: z.array(z.string()).optional().describe("A list of tags associated with the content."),
});
export type RecommendationReasonInput = z.infer<typeof RecommendationReasonInputSchema>;

const RecommendationReasonOutputSchema = z.object({
  reason: z.string().describe("A short, engaging, personalized sentence explaining why this item is recommended. Start with 'For you because...' or a similar phrase."),
});
export type RecommendationReasonOutput = z.infer<typeof RecommendationReasonOutputSchema>;

export async function getRecommendationReason(input: RecommendationReasonInput): Promise<RecommendationReasonOutput> {
  return recommendationReasonFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendationReasonPrompt',
  input: {schema: RecommendationReasonInputSchema},
  output: {schema: RecommendationReasonOutputSchema},
  prompt: `You are a recommendation engine for a creative platform called 'YourSpace'.
Your task is to generate a single, compelling, and personalized sentence explaining why a piece of content is being recommended to a user.
The tone should be friendly and insightful. Start the reason with a phrase like "For you because...", "You might like this since...", or "Based on your interest in...".

Keep the reason concise and focused on a single connection point.

**User Profile:**
- Skills: {{{json userSkills}}}
- Interests: {{{json userInterests}}}

**Content to Recommend:**
- Title: "{{{creationTitle}}}"
- Type: {{{creationType}}}
- Tags: {{{json creationTags}}}

Generate a recommendation reason that connects the user's profile to the content.
For example, if the user is interested in 'sci-fi' and the content is a 'space opera', you could say: "Because you're a fan of sci-fi, here's a space opera you might enjoy."
If the user is skilled in 'Music Production' and the content is a 'Synthwave track', you could say: "With your skills in music production, you might appreciate the sound design in this track."
`,
});

const recommendationReasonFlow = ai.defineFlow(
  {
    name: 'recommendationReasonFlow',
    inputSchema: RecommendationReasonInputSchema,
    outputSchema: RecommendationReasonOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI did not return a recommendation reason.');
    }
    return output;
  }
);
