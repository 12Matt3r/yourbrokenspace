'use server';
/**
 * @fileOverview An AI agent that generates a UI theme for a user's profile space.
 *
 * - generateTheme - A function that handles the theme generation process.
 * - ThemeGeneratorInput - The input type for the generateTheme function.
 * - ThemeGeneratorOutput - The return type for the generateTheme function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ThemeGeneratorInputSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters long.").max(200, "Prompt must be at most 200 characters long."),
});
export type ThemeGeneratorInput = z.infer<typeof ThemeGeneratorInputSchema>;

const FontEnumSchema = z.enum(['Space Grotesk', 'Lora', 'Roboto Mono', 'Playfair Display']);

const ThemeGeneratorOutputSchema = z.object({
  pageBackgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color.").describe("The primary background color for the entire page."),
  pageTextColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color.").describe("The main text color, ensuring high contrast with pageBackgroundColor."),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color.").describe("A vibrant accent color for links, buttons, and highlights."),
  cardBackgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color.").describe("The background color for card elements."),
  cardTextColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color.").describe("The text color for content within cards, ensuring high contrast with cardBackgroundColor."),
  headingFont: FontEnumSchema.describe("The font for main headings."),
  bodyFont: FontEnumSchema.describe("The font for body text."),
  suggestedBackgroundPrompt: z.string().describe("A concise, descriptive prompt (max 15 words) for an AI image generator to create a suitable background image for this theme."),
});
export type ThemeGeneratorOutput = z.infer<typeof ThemeGeneratorOutputSchema>;

export async function generateTheme(input: ThemeGeneratorInput): Promise<ThemeGeneratorOutput> {
  return themeGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'themeGeneratorPrompt',
  input: {schema: ThemeGeneratorInputSchema},
  output: {schema: ThemeGeneratorOutputSchema},
  prompt: `You are an expert UI/UX designer specializing in creating harmonious and accessible color palettes and typographic combinations for personal websites.

Your task is to generate a complete UI theme based on the user's descriptive prompt. The generated theme must be aesthetically pleasing, accessible (ensure text has good contrast with its background), and adhere strictly to the output schema.

Available Fonts: 'Space Grotesk', 'Lora', 'Roboto Mono', 'Playfair Display'. Choose the best pair for the requested vibe.

**User's Theme Prompt:**
"{{{prompt}}}"

---
Generate the full theme now. Ensure all color values are valid 6-digit hex codes. The 'suggestedBackgroundPrompt' should be creative and directly related to the user's prompt, suitable for a text-to-image AI.
`,
});

const themeGeneratorFlow = ai.defineFlow(
  {
    name: 'themeGeneratorFlow',
    inputSchema: ThemeGeneratorInputSchema,
    outputSchema: ThemeGeneratorOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error('AI did not return a theme. Please try a different prompt.');
    }
    return output;
  }
);
