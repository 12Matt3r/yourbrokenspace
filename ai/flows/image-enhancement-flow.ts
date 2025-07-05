
'use server';
/**
 * @fileOverview An AI agent that provides expert feedback on images.
 *
 * - getImageFeedback - A function that handles the image feedback process.
 * - ImageEnhancementInput - The input type for the getImageFeedback function.
 * - ImageEnhancementOutput - The return type for the getImageFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ImageEnhancementInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo or digital artwork, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().describe("The user's description of the image or their artistic goal."),
  analysisGoals: z.array(z.enum(['composition', 'color', 'style'])).min(1, "Select at least one analysis goal."),
});
export type ImageEnhancementInput = z.infer<typeof ImageEnhancementInputSchema>;

const ImageEnhancementOutputSchema = z.object({
  compositionFeedback: z.string().optional().describe("Critique and suggestions regarding the image's composition, framing, and balance."),
  colorFeedback: z.string().optional().describe("Feedback on the color palette, harmony, contrast, and mood."),
  styleSuggestions: z.array(z.string()).optional().describe("A list of 2-3 potential artistic filters or style adjustments (e.g., 'Glow Filter', 'Cinematic Look', 'Vintage Film Grain')."),
  generalCritique: z.string().describe("An overall summary of the image's strengths and areas for potential improvement."),
});
export type ImageEnhancementOutput = z.infer<typeof ImageEnhancementOutputSchema>;

export async function getImageFeedback(input: ImageEnhancementInput): Promise<ImageEnhancementOutput> {
  return imageEnhancementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'imageEnhancementPrompt',
  input: {schema: ImageEnhancementInputSchema},
  output: {schema: ImageEnhancementOutputSchema},
  prompt: `You are an expert art director and photo editor providing feedback on a creative image.
Analyze the provided image and the user's description. Your feedback should be constructive, insightful, and encouraging.

**User's Description/Goal:**
"{{{description}}}"

**User's Analysis Goals:**
{{#each analysisGoals}}
- {{{this}}}
{{/each}}

**Image to Analyze:**
{{media url=imageDataUri}}

---
Based on the user's goals, provide the following structured output. Only generate fields for the goals the user has selected.

{{#if (includes analysisGoals "composition")}}
- **Composition Feedback**: Analyze the rule of thirds, leading lines, balance, and framing. Offer specific suggestions for how the composition could be strengthened.
{{/if}}

{{#if (includes analysisGoals "color")}}
- **Color Feedback**: Discuss the color palette. Is it harmonious? Does it evoke the right mood? Suggest specific adjustments to saturation, contrast, or color balance to enhance the image.
{{/if}}

{{#if (includes analysisGoals "style")}}
- **Artistic Style Suggestions**: Suggest 2-3 creative filters or style adjustments that could fit this image. For example: "Cinematic Look," "Glow Filter," "Vintage Film Grain," or "Painterly Effect." Be creative.
{{/if}}

- **General Critique**: Provide an overall summary of the image. Start by highlighting its strengths, then offer the most important areas for improvement in a constructive manner.
`,
});

// Helper for Handlebars to check if an array includes a value
import Handlebars from 'handlebars';
Handlebars.registerHelper('includes', function (array, value, options) {
  if (Array.isArray(array) && array.includes(value)) {
    return options.fn(this);
  }
  return options.inverse(this);
});


const imageEnhancementFlow = ai.defineFlow(
  {
    name: 'imageEnhancementFlow',
    inputSchema: ImageEnhancementInputSchema,
    outputSchema: ImageEnhancementOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error('AI did not return an output for image feedback.');
    }
    return output;
  }
);
