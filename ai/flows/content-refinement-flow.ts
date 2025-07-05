
'use server';
/**
 * @fileOverview An AI agent that provides suggestions for refining text-based content.
 *
 * - refineContent - A function that handles the content refinement process.
 * - ContentRefinementInput - The input type for the refineContent function.
 * - ContentRefinementOutput - The return type for the refineContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { AnalysisGoalSchema, ContentTypeSchema } from '@/app/content-refinement/schemas';

const ContentRefinementInputSchema = z.object({
  contentText: z.string().min(50, "Content text must be at least 50 characters.").max(5000, "Content text must be at most 5000 characters."),
  contentType: ContentTypeSchema,
  analysisGoals: z.array(AnalysisGoalSchema).min(1, "Select at least one analysis goal."),
});
export type ContentRefinementInput = z.infer<typeof ContentRefinementInputSchema>;

const ImprovementPointSchema = z.object({
  point: z.string().describe("Specific part of the text or aspect being addressed."),
  suggestion: z.string().describe("Concrete suggestion for improvement related to the point."),
});

const ContentRefinementOutputSchema = z.object({
  suggestedTitles: z.array(z.string()).optional().describe("A list of 2-3 alternative titles for the content."),
  keywordSuggestions: z.array(z.string()).optional().describe("A list of 5-7 relevant keywords for discoverability."),
  clarityFeedback: z.string().optional().describe("Overall feedback on the clarity and readability of the content."),
  toneAnalysis: z.string().optional().describe("Analysis of the content's tone and suggestions for adjustment if requested."),
  improvementPoints: z.array(ImprovementPointSchema).optional().describe("Specific, actionable points for improving the content based on selected goals."),
});
export type ContentRefinementOutput = z.infer<typeof ContentRefinementOutputSchema>;

export async function refineContent(input: ContentRefinementInput): Promise<ContentRefinementOutput> {
  return contentRefinementFlow(input);
}

// Helper for Handlebars to check if an array includes a value
import Handlebars from 'handlebars';
Handlebars.registerHelper('includes', function (array, value, options) {
  if (Array.isArray(array) && array.includes(value)) {
    return options.fn(this);
  }
  return options.inverse(this);
});

const prompt = ai.definePrompt({
  name: 'contentRefinementPrompt',
  input: {schema: ContentRefinementInputSchema},
  output: {schema: ContentRefinementOutputSchema},
  prompt: `You are an expert creative editor and coach for 'YourSpace'.
Your task is to analyze the provided text content and offer constructive suggestions based on the user's specified analysis goals.

Content Type: {{{contentType}}}
User's Analysis Goals:
{{#each analysisGoals}}
- {{{this}}}
{{/each}}

Content Text to Analyze:
---
{{{contentText}}}
---

Based on the user's goals, provide the following structured output. Only generate fields for the goals the user has selected.

{{#if (includes analysisGoals "suggest_titles")}}
- **Suggested Titles**: Generate 2-3 compelling alternative titles for the content.
{{/if}}

{{#if (includes analysisGoals "keyword_optimization")}}
- **Keyword Suggestions**: Identify 5-7 relevant keywords or phrases that would improve discoverability.
{{/if}}

{{#if (includes analysisGoals "improve_clarity")}}
- **Clarity Feedback**: Offer overall feedback on how to improve the clarity, flow, and impact of the text. Focus on conciseness, strong verbs, and engaging language.
- **Improvement Points (for clarity)**: Identify specific sentences or phrases and suggest concrete revisions using the ImprovementPointSchema format.
{{/if}}

{{#if (includes analysisGoals "tone_adjustment")}}
- **Tone Analysis**: Describe the current tone of the text. If improvements are needed, suggest how the tone could be adjusted to better suit the content type or common expectations for it.
- **Improvement Points (for tone)**: Identify specific parts where tone could be improved and offer suggestions using the ImprovementPointSchema format.
{{/if}}

If providing improvement points, make them actionable and specific.
Structure your output according to the ContentRefinementOutputSchema.
Be encouraging and constructive in your feedback.
`,
});

const contentRefinementFlow = ai.defineFlow(
  {
    name: 'contentRefinementFlow',
    inputSchema: ContentRefinementInputSchema,
    outputSchema: ContentRefinementOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error('AI did not return an output for content refinement.');
    }
    // Ensure optional arrays are present if empty, as per schema expectations for some cases
    return {
        suggestedTitles: output.suggestedTitles,
        keywordSuggestions: output.keywordSuggestions,
        clarityFeedback: output.clarityFeedback,
        toneAnalysis: output.toneAnalysis,
        improvementPoints: output.improvementPoints,
    };
  }
);
