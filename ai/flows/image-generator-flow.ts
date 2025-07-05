
'use server';
/**
 * @fileOverview An AI agent that generates images from a text prompt.
 *
 * - generateImage - A function that handles the image generation process.
 * - ImageGeneratorInput - The input type for the generateImage function.
 * - ImageGeneratorOutput - The return type for the generateImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ImageGeneratorInputSchema = z.object({
  prompt: z.string().min(3, "Prompt must be at least 3 characters.").max(1000, "Prompt must be at most 1000 characters."),
});
export type ImageGeneratorInput = z.infer<typeof ImageGeneratorInputSchema>;

const ImageGeneratorOutputSchema = z.object({
  imageDataUri: z.string().describe("The generated image as a data URI."),
});
export type ImageGeneratorOutput = z.infer<typeof ImageGeneratorOutputSchema>;

// Exported wrapper function
export async function generateImage(input: ImageGeneratorInput): Promise<ImageGeneratorOutput> {
  return imageGeneratorFlow(input);
}

const imageGeneratorFlow = ai.defineFlow(
  {
    name: 'imageGeneratorFlow',
    inputSchema: ImageGeneratorInputSchema,
    outputSchema: ImageGeneratorOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      // This specific model is required for image generation.
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: input.prompt,
      config: {
        // Response must include both TEXT and IMAGE modalities.
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('AI did not return an image. The prompt may have been blocked by safety filters or a server error occurred.');
    }

    return { imageDataUri: media.url };
  }
);
