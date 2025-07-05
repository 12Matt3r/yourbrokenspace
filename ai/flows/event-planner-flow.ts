
'use server';
/**
 * @fileOverview An AI agent that helps creators plan community events.
 *
 * - planEvent - A function that handles the event planning process.
 * - EventPlannerInput - The input type for the planEvent function.
 * - EventPlannerOutput - The return type for the planEvent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

export const EventPlannerInputSchema = z.object({
  eventIdea: z.string().min(10, "Please describe your event idea in at least 10 characters.").max(300, "Event idea must be at most 300 characters."),
  creatorName: z.string().describe("The name of the creator hosting the event."),
});
export type EventPlannerInput = z.infer<typeof EventPlannerInputSchema>;

export const EventPlannerOutputSchema = z.object({
  suggestedTitle: z.string().describe("A catchy and descriptive title for the event."),
  suggestedDescription: z.string().describe("An engaging and detailed description for the event page, formatted nicely."),
  suggestedTags: z.array(z.string()).min(3).max(5).describe("A list of 3-5 relevant tags for discoverability."),
});
export type EventPlannerOutput = z.infer<typeof EventPlannerOutputSchema>;

export async function planEvent(input: EventPlannerInput): Promise<EventPlannerOutput> {
  return eventPlannerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'eventPlannerPrompt',
  input: {schema: EventPlannerInputSchema},
  output: {schema: EventPlannerOutputSchema},
  prompt: `You are an expert event planner and copywriter for a creative community platform called 'YourSpace'.
Your task is to help a creator flesh out their event idea into a compelling event listing.

The creator, named {{{creatorName}}}, has this initial idea:
"{{{eventIdea}}}"

Based on this idea, generate the following:
1.  **suggestedTitle**: A catchy, exciting title for the event.
2.  **suggestedDescription**: An engaging description (2-4 paragraphs) that explains what the event is, who it's for, and why people should attend. Use a friendly and encouraging tone.
3.  **suggestedTags**: A list of 3-5 relevant and specific tags to help with discoverability.

Make the output structured and ready for a website.
`,
});

const eventPlannerFlow = ai.defineFlow(
  {
    name: 'eventPlannerFlow',
    inputSchema: EventPlannerInputSchema,
    outputSchema: EventPlannerOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error('AI did not return an event plan. Please try a different idea.');
    }
    return output;
  }
);
