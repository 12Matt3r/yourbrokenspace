
'use server';
/**
 * @fileOverview An AI agent that generates a portfolio layout for a creative professional.
 *
 * - generatePortfolio - A function that handles the portfolio generation process.
 * - PortfolioGeneratorInput - The input type for the generatePortfolio function.
 * - PortfolioGeneratorOutput - The return type for the generatePortfolio function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const WorkSampleSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().url().describe("The URL of the work sample image."),
});

const PortfolioGeneratorInputSchema = z.object({
  artisticStyle: z.string().describe("A detailed description of the artist's style."),
  preferences: z.string().optional().describe("Specific preferences for the portfolio layout, like section order or emphasis."),
  template: z.enum(['minimalist', 'grid', 'dynamic']).describe("The base template to use for the portfolio."),
  workSamples: z.array(WorkSampleSchema).min(1).describe("An array of the artist's work samples."),
});
export type PortfolioGeneratorInput = z.infer<typeof PortfolioGeneratorInputSchema>;

const PortfolioGeneratorOutputSchema = z.object({
  layout: z.array(z.object({
    component: z.enum(['hero', 'gallery', 'about', 'contact']).describe("The type of portfolio section."),
    order: z.number().describe("The display order of the section."),
    content: z.any().describe("The content for the section, structured based on its component type."),
  })).describe("The ordered list of sections for the portfolio layout."),
  suggestions: z.array(z.string()).optional().describe("A list of 2-3 actionable suggestions for improving the portfolio."),
});
export type PortfolioGeneratorOutput = z.infer<typeof PortfolioGeneratorOutputSchema>;

export async function generatePortfolio(input: PortfolioGeneratorInput): Promise<PortfolioGeneratorOutput> {
  return portfolioGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'portfolioGeneratorPrompt',
  input: { schema: PortfolioGeneratorInputSchema },
  output: { schema: PortfolioGeneratorOutputSchema },
  prompt: `You are an expert portfolio designer for creative professionals. Your task is to generate a customized portfolio layout based on the artist's input.

You must generate a layout containing four distinct sections: 'hero', 'gallery', 'about', 'contact'. You will determine the best order for these sections.

- **Hero Section:** Create a compelling hero section. Use the artist's style description to invent a plausible artist name and a short, impactful tagline.
- **Gallery Section:** Arrange all the provided work samples into a gallery.
- **About Section:** Write a brief, engaging "About Me" text based on the artist's style description. It should sound authentic and professional.
- **Contact Section:** Create a simple contact section with a call-to-action and a placeholder email like 'contact@artistname.com'.

Based on the chosen template, adjust your layout approach:
- **Minimalist:** Emphasize clean layouts, ample white space, and a simple, logical flow (e.g., Hero, Gallery, About, Contact).
- **Grid-Focused:** Prioritize the gallery. It should be the most prominent section, likely appearing high up in the order.
- **Dynamic & Modern:** Feel free to suggest a more unconventional order, perhaps starting with a strong 'About' statement or an immediate gallery.

Finally, provide 2-3 concise, actionable suggestions for how the artist could improve their portfolio presentation (e.g., "Consider adding case studies for your projects," or "A consistent color palette across your work would strengthen your brand.").

**Artist's Input:**
- Artistic Style: {{{artisticStyle}}}
- Layout Preferences: {{{preferences}}}
- Chosen Template: {{{template}}}
- Work Samples:
{{#each workSamples}}
  - Title: "{{title}}", Description: "{{description}}", Image: {{imageUrl}}
{{/each}}
`,
});

const portfolioGeneratorFlow = ai.defineFlow(
  {
    name: 'portfolioGeneratorFlow',
    inputSchema: PortfolioGeneratorInputSchema,
    outputSchema: PortfolioGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI did not return a portfolio layout.');
    }
    // Ensure the output has the four required sections
    const requiredComponents = new Set(['hero', 'gallery', 'about', 'contact']);
    const presentComponents = new Set(output.layout.map(s => s.component));
    if (requiredComponents.size !== presentComponents.size) {
        throw new Error('AI did not generate all required portfolio sections.');
    }
    return output;
  }
);
