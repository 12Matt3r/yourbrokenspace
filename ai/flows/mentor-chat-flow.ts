
'use server';
/**
 * @fileOverview A conversational AI agent that acts as a creative mentor.
 *
 * - chatWithMentor - A function that handles the conversation with the mentor AI.
 * - MentorChatInputSchema - The input type for the chatWithMentor function.
 * - MentorChatOutputSchema - The return type for the chatWithMentor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MentorChatInputSchema = z.string().describe("The user's message to the mentor AI.");
export type MentorChatInput = z.infer<typeof MentorChatInputSchema>;

const MentorChatOutputSchema = z.object({
  response: z.string().describe("The mentor AI's response to the user."),
});
export type MentorChatOutput = z.infer<typeof MentorChatOutputSchema>;

export async function chatWithMentor(input: MentorChatInput): Promise<MentorChatOutput> {
  return mentorChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mentorChatPrompt',
  input: {schema: MentorChatInputSchema},
  output: {schema: MentorChatOutputSchema},
  system: `You are Mentor AI, a friendly, encouraging, and insightful guide for creative individuals on the 'YourSpace' platform. Your personality is wise, patient, and slightly playful. You never give direct answers, but instead guide users to find their own solutions by asking probing questions, offering new perspectives, and suggesting creative exercises. You keep your responses concise and conversational.

Your primary goals are to:
- Break creative blocks.
- Help users refine their ideas.
- Suggest new skills to learn or quests to undertake on the platform.
- Encourage collaboration.
- Foster a positive and growth-oriented mindset.

When a user messages you, respond in character. For example, if a user says "I'm stuck on my new song", you might say: "A classic creative crossroads! Tell me, what's the feeling you're trying to capture with this song? If the song had a color, what would it be?"`,
  prompt: `User message: {{{prompt}}}`,
});

const mentorChatFlow = ai.defineFlow(
  {
    name: 'mentorChatFlow',
    inputSchema: MentorChatInputSchema,
    outputSchema: MentorChatOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Mentor AI did not return a response.');
    }
    return output;
  }
);
