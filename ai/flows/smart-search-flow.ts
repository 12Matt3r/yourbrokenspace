
'use server';
/**
 * @fileOverview An AI agent that parses natural language queries into structured search filters.
 *
 * - smartSearchFlow - The main flow that handles the query parsing.
 * - SmartSearchInput - The input type for the flow.
 * - SmartSearchOutput - The return type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartSearchInputSchema = z.object({
  query: z.string().describe('The natural language search query from the user.'),
  availableTags: z.array(z.string()).describe('A list of available tags to choose from.'),
});
export type SmartSearchInput = z.infer<typeof SmartSearchInputSchema>;

const SmartSearchOutputSchema = z.object({
  category: z.enum(['Image', 'Audio', 'Code', 'Game', 'Video', 'Writing', 'all']).describe('The single best content category for the query. Defaults to "all".'),
  primaryTag: z.string().describe('The single most relevant tag for the query, in lowercase. Must be one of the availableTags or an empty string.'),
});
export type SmartSearchOutput = z.infer<typeof SmartSearchOutputSchema>;

export async function smartSearch(input: SmartSearchInput): Promise<SmartSearchOutput> {
  return smartSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartSearchPrompt',
  input: {schema: SmartSearchInputSchema},
  output: {schema: SmartSearchOutputSchema},
  prompt: `You are an intelligent search query parser for a creative platform.
Your task is to analyze a user's natural language query and convert it into structured search parameters.

- Identify the single best **category** of creation the user is looking for. The category MUST be one of: 'Image', 'Audio', 'Code', 'Game', 'Video', 'Writing', or 'all'. Default to 'all' if unsure.
- Extract the single most relevant **primaryTag** from the query. The tag should be a descriptive keyword (e.g., 'ambient', 'sci-fi', 'pixel art', 'cinematic').
- The returned 'primaryTag' MUST be one of the provided 'availableTags'. If you extract a tag that isn't in the list, choose the closest available synonym or a more general tag from the list. If no tag in the query matches or relates to any availableTags, return an empty string for the primaryTag.

The list of available tags is: {{{json availableTags}}}

Query: "{{{query}}}"
`,
});

const smartSearchFlow = ai.defineFlow(
  {
    name: 'smartSearchFlow',
    inputSchema: SmartSearchInputSchema,
    outputSchema: SmartSearchOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
