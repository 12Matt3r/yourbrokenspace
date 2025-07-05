
'use server';
/**
 * @fileOverview An AI agent that generates a visual graph of related concepts for a search query.
 *
 * - visualSearch - A function that handles the visual search process.
 * - VisualSearchInput - The input type for the function.
 * - VisualSearchOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const VisualSearchInputSchema = z.object({
  query: z.string().min(2, "Query must be at least 2 characters.").max(100, "Query must be at most 100 characters."),
});
export type VisualSearchInput = z.infer<typeof VisualSearchInputSchema>;

const NodeSchema = z.object({
    label: z.string().describe("The name of the connected entity (e.g., a creator's username, a creation's title, a tag, or a related concept)."),
    type: z.enum(['creator', 'creation', 'tag', 'concept']).describe("The type of the connected node."),
    connectionReason: z.string().describe("A very short (3-7 word) explanation of why this node is connected to the central query."),
});

const VisualSearchOutputSchema = z.object({
  centralNodeLabel: z.string().describe("The label for the central node, which should be the user's original query."),
  connectedNodes: z.array(NodeSchema).min(4).max(8).describe("A list of 4-8 connected nodes that are highly relevant to the user's query."),
});
export type VisualSearchOutput = z.infer<typeof VisualSearchOutputSchema>;

export async function visualSearch(input: VisualSearchInput): Promise<VisualSearchOutput> {
  return visualSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'visualSearchPrompt',
  input: {schema: VisualSearchInputSchema},
  output: {schema: VisualSearchOutputSchema},
  prompt: `You are a creative librarian for a platform called 'YourSpace'. Your task is to take a user's search query and generate a visual "mind map" of related concepts, creators, creations, and tags.

The user's query is: "{{{query}}}"

Based on this query, generate a central node label (which should be the query itself) and a list of 4 to 8 highly relevant connected nodes.
For each connected node, provide:
- A concise 'label' (e.g., a creator's username, a creation title, a tag, or a related artistic concept).
- The 'type' of the node ('creator', 'creation', 'tag', 'concept').
- A very short 'connectionReason' (3-7 words) explaining the link to the query.

Example: If the query is "lofi hip hop", you might generate:
- Creator: @ChillhopMaster, Reason: Prolific lofi beatmaker.
- Creation: "Midnight Train", Reason: Classic lofi study track.
- Tag: "studymusic", Reason: Commonly used for focus.
- Concept: "Nostalgia", Reason: Core emotional theme.
- Concept: "Sampling Vinyl", Reason: Key production technique.

Generate a diverse and interesting set of connections. Be creative and insightful.
`,
});

const visualSearchFlow = ai.defineFlow(
  {
    name: 'visualSearchFlow',
    inputSchema: VisualSearchInputSchema,
    outputSchema: VisualSearchOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("AI couldn't generate a visual search map for this query.");
    }
    return {...output, centralNodeLabel: input.query }; // Ensure the central node is the original query
  }
);
