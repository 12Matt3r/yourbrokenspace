
'use server';
/**
 * @fileOverview An AI agent that generates personalized learning paths for creators.
 *
 * - generateLearningPath - A function that handles the learning path generation process.
 * - LearningPathGeneratorInput - The input type for the generateLearningPath function.
 * - LearningPathGeneratorOutput - The return type for the generateLearningPath function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Input Schema
const LearningPathGeneratorInputSchema = z.object({
  topic: z.string().describe("The topic or skill the user wants to learn. This can be a simple phrase like 'pixel art' or a more complex goal like 'how to produce lofi hip-hop'."),
  userSkills: z.array(z.string()).optional().describe("A list of the user's existing skills to help tailor the path."),
});
export type LearningPathGeneratorInput = z.infer<typeof LearningPathGeneratorInputSchema>;


// Output Schemas
const LearningPathStepSchema = z.object({
  id: z.string().describe("A unique ID for the step, e.g., 'lp1s1'."),
  title: z.string().describe("The title of the learning step."),
  description: z.string().describe("A brief description of what this step entails."),
  type: z.enum(['article', 'video', 'project', 'quiz']).describe("The type of learning material for this step."),
  durationEstimate: z.string().describe("A plausible time estimate for the step, e.g., '45m', '1h 30m', '2h'."),
});

const LearningPathSchema = z.object({
  id: z.string().describe("A unique ID for the learning path, e.g., 'lp-gen-1'."),
  title: z.string().describe("A compelling title for the entire learning path that reflects the user's topic."),
  description: z.string().describe("A one or two-sentence summary of what the user will learn."),
  category: z.enum(['Digital Art', 'Music Production', 'Web Development', 'Game Development', 'Creative AI', 'Video Editing', 'Creative Writing', 'Glitch Art']).describe("The most relevant category for this learning path."),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).describe("The difficulty level of the path."),
  author: z.string().describe("An inventive but plausible creator name for the author of this path (e.g., 'Professor Pixel', 'Synth Sensei')."),
  authorUsername: z.string().describe("A corresponding plausible username in lowercase with no spaces (e.g., 'profpixel', 'synthsensei')."),
  steps: z.array(LearningPathStepSchema).min(3).max(5).describe("A list of 3-5 sequential learning steps."),
});

const LearningPathGeneratorOutputSchema = z.object({
    paths: z.array(LearningPathSchema).min(1).max(2).describe("A list of 1 or 2 generated learning paths based on the user's request. If the topic is broad, you can generate two related but distinct paths.")
});
export type LearningPathGeneratorOutput = z.infer<typeof LearningPathGeneratorOutputSchema>;


export async function generateLearningPath(input: LearningPathGeneratorInput): Promise<LearningPathGeneratorOutput> {
  return learningPathGeneratorFlow(input);
}


const prompt = ai.definePrompt({
  name: 'learningPathGeneratorPrompt',
  input: { schema: LearningPathGeneratorInputSchema },
  output: { schema: LearningPathGeneratorOutputSchema },
  prompt: `You are an expert curriculum designer and creative coach for 'YourSpace', a platform for creators.
Your task is to generate a complete, personalized learning path for a user based on their desired topic.

The generated path must be practical, well-structured, and inspiring.
Invent a plausible author for each path.
Ensure all steps are logical and sequential.

**User's Learning Goal:**
Topic: "{{{topic}}}"

{{#if userSkills}}
**User's Existing Skills (for context):**
{{#each userSkills}}
- {{{this}}}
{{/each}}
{{/if}}

---
Based on the user's request, generate 1-2 distinct learning paths.
Each path should contain 3-5 clear steps.
Each step should have a title, description, type (article, video, project, quiz), and a realistic duration estimate.
Choose the most appropriate category and difficulty for the path.
Structure your output strictly according to the provided JSON schema.
`,
});

const learningPathGeneratorFlow = ai.defineFlow(
  {
    name: 'learningPathGeneratorFlow',
    inputSchema: LearningPathGeneratorInputSchema,
    outputSchema: LearningPathGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output || !output.paths || output.paths.length === 0) {
        throw new Error('AI did not return any learning paths. Please try a different topic.');
    }
    return output;
  }
);
