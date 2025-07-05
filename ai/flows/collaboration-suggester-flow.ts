
'use server';
/**
 * @fileOverview An AI agent that suggests potential collaborators for a user.
 *
 * - suggestCollaborators - A function that handles the collaboration suggestion process.
 * - CollaborationSuggesterInput - The input type for the suggestCollaborators function.
 * - CollaborationSuggesterOutput - The return type for the suggestCollaborators function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CollaborationSuggesterInputSchema = z.object({
  userName: z.string().describe("The name of the user seeking collaborations."),
  userCreationsSummary: z.array(z.object({
    title: z.string(),
    type: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })).min(1).describe("A summary of the user's notable creative works (at least one)."),
  userSkills: z.array(z.string()).min(1).describe("A list of the user's primary skills (at least one)."),
  userInterests: z.array(z.string()).min(1).describe("A list of the user's creative interests, preferred themes, or vibes (at least one)."),
  projectNeeds: z.string().optional().describe("A specific description of what the user is looking for in a collaborator or project (e.g., 'a vocalist for a pop track', 'a 2D artist for a game jam')."),
});
export type CollaborationSuggesterInput = z.infer<typeof CollaborationSuggesterInputSchema>;

const SuggestedCollaboratorSchema = z.object({
  collaboratorUsername: z.string().describe("A plausible, invented username for a suggested collaborator (e.g., 'PixelPirate', 'SynthDreamer', 'StoryForge')."),
  collaboratorCreatorType: z.string().describe("The primary creative discipline of the suggested collaborator (e.g., Musician, Visual Artist, Writer, Game Developer)."),
  reasoning: z.string().describe("A concise explanation of why this collaboration would be beneficial or interesting, highlighting complementary skills, shared themes, potential for innovative fusion, or filling a skill gap for the user."),
  suggestedProjectIdeas: z.array(z.string()).min(1).max(2).describe("One or two concrete and creative project ideas for this collaboration. Be specific about what they could create together."),
});

const CollaborationSuggesterOutputSchema = z.object({
  suggestions: z.array(SuggestedCollaboratorSchema).min(2).max(3).describe("A list of 2-3 distinct AI-generated collaboration suggestions."),
});
export type CollaborationSuggesterOutput = z.infer<typeof CollaborationSuggesterOutputSchema>;

export async function suggestCollaborators(input: CollaborationSuggesterInput): Promise<CollaborationSuggesterOutput> {
  return collaborationSuggesterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'collaborationSuggesterPrompt',
  input: {schema: CollaborationSuggesterInputSchema},
  output: {schema: CollaborationSuggesterOutputSchema},
  prompt: `You are an expert creative director and community connector for 'YourSpace', a platform for artists.
Your task is to suggest 2-3 potential (but fictional/invented) collaborators for a user based on their profile and specific needs.
For each suggestion, provide a plausible username, their primary creator type, a strong reasoning for the collaboration, and 1-2 specific project ideas.

Focus on:
- Complementary skills: How can they fill gaps in each other's abilities?
- Shared themes/interests: What common ground could lead to exciting work?
- Innovative fusion: What unique combination of styles could they create?
- User's specific needs: If the user has described what they are looking for, prioritize suggestions that meet those needs.

**User Profile:**
Name: {{{userName}}}

**User's Notable Creations:**
{{#each userCreationsSummary}}
- Title: "{{title}}" (Type: {{type}})
  {{#if description}}Description: {{description}}{{/if}}
  {{#if tags}}Tags: {{tags.join ", "}}{{/if}}
{{/each}}

**User's Primary Skills:**
{{#each userSkills}}
- {{{this}}}
{{/each}}

**User's Creative Interests/Vibes:**
{{#each userInterests}}
- {{{this}}}
{{/each}}

{{#if projectNeeds}}
**User's Specific Project Needs:**
"{{{projectNeeds}}}"
---
Prioritize suggestions that directly address these needs. For example, if they need a "vocalist", suggest a singer. If they need a "pixel artist", suggest a visual artist specializing in that.
{{/if}}

Generate 2 to 3 distinct and plausible collaborator suggestions.
Ensure the project ideas are concrete and inspiring.
The collaborator profiles you invent should be diverse in their skills and creator types.
Do not suggest collaborators that are too similar to the user; aim for complementary pairings.
`,
});

const collaborationSuggesterFlow = ai.defineFlow(
  {
    name: 'collaborationSuggesterFlow',
    inputSchema: CollaborationSuggesterInputSchema,
    outputSchema: CollaborationSuggesterOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error('AI did not return an output for collaboration suggestions.');
    }
    return output;
  }
);
