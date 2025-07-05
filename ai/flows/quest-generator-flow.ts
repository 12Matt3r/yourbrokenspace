
'use server';
/**
 * @fileOverview An AI agent that generates personalized creative quests for a user.
 *
 * - generateCreativeQuests - A function that handles the quest generation process.
 * - QuestGeneratorInput - The input type for the generateCreativeQuests function.
 * - QuestGeneratorOutput - The return type for the generateCreativeQuests function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuestGeneratorInputSchema = z.object({
  userSkills: z.array(z.string()).describe("The user's primary skills (e.g., 'Pixel Art', 'Music Production')."),
  userInterests: z.array(z.string()).describe("The user's creative interests or preferred themes (e.g., 'sci-fi', 'fantasy', 'lofi')."),
  recentCreations: z.array(z.object({
    title: z.string(),
    type: z.string(),
  })).optional().describe("A list of the user's recent creations to provide context."),
});
export type QuestGeneratorInput = z.infer<typeof QuestGeneratorInputSchema>;

const QuestSchema = z.object({
  title: z.string().describe("A short, catchy title for the quest (e.g., '15-Minute Micro-Melody', 'Pixel Art Sprite Challenge')."),
  description: z.string().describe("A concise but inspiring description of the task, guiding the user on what to create."),
  reward: z.string().describe("A plausible, motivating reward for completing the quest (e.g., '+20 XP', '+50 XP & Themed Badge')."),
  icon: z.enum(['Palette', 'Music', 'Code', 'PenTool', 'Gamepad2', 'Sparkles']).describe("The most appropriate icon name for the quest category."),
});

const QuestGeneratorOutputSchema = z.object({
  quests: z.array(QuestSchema).min(2).max(3).describe("A list of 2-3 personalized creative quests."),
});
export type QuestGeneratorOutput = z.infer<typeof QuestGeneratorOutputSchema>;

export async function generateCreativeQuests(input: QuestGeneratorInput): Promise<QuestGeneratorOutput> {
  return questGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'questGeneratorPrompt',
  input: {schema: QuestGeneratorInputSchema},
  output: {schema: QuestGeneratorOutputSchema},
  prompt: `You are Mentor AI, an encouraging creative coach on the 'YourSpace' platform.
Your task is to generate 2-3 personalized, actionable, and inspiring "Creative Quests" for a user based on their profile.

These quests should be small, achievable tasks designed to spark creativity, encourage practice, or push them to try something slightly new.

**User Profile:**
- Primary Skills: {{#each userSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Interests/Vibes: {{#each userInterests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{#if recentCreations}}
- Recent Creations:
  {{#each recentCreations}}
  - "{{title}}" ({{type}})
  {{/each}}
{{/if}}

**Quest Generation Guidelines:**
1.  **Tailor to Skills:** Create quests directly related to the user's skills. If they are a 'Pixel Artist', suggest a sprite challenge. If a 'Musician', suggest a melody or drum loop creation.
2.  **Incorporate Interests:** Blend their interests into the quests. If they like 'sci-fi' and are a 'Writer', suggest a quest like "Write a 100-word flash fiction piece about a lonely robot."
3.  **Keep it Bite-Sized:** Quests should feel completable in a single session (e.g., 15-60 minutes).
4.  **Suggest an Appropriate Icon:** Based on the quest's nature, choose the best icon from the available list: 'Palette' for art, 'Music' for audio, 'Code' for development, 'PenTool' for writing, 'Gamepad2' for game design, 'Sparkles' for general creativity.
5.  **Invent Plausible Rewards:** Create simple, motivating rewards like XP points or fictional badges.

Generate a list of 2-3 distinct and engaging quests.
`,
});

const questGeneratorFlow = ai.defineFlow(
  {
    name: 'questGeneratorFlow',
    inputSchema: QuestGeneratorInputSchema,
    outputSchema: QuestGeneratorOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Mentor AI did not return any quests.');
    }
    return output;
  }
);
