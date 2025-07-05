
'use server';

import { generateLearningPath } from '@/ai/flows/learning-path-generator-flow';
import type { LearningPathState } from './schemas';

// In a real app, this would come from the logged-in user's session
const MOCK_USER_SKILLS = ["Digital Painting", "Music Production"];

export async function getLearningPathAction(
  prevState: LearningPathState,
  formData: FormData
): Promise<LearningPathState> {
  const topic = formData.get('topic') as string;
  if (!topic || topic.trim().length < 5) {
    return {
        ...prevState, // Return previous paths
        error: "Please enter a topic with at least 5 characters.",
        topic: topic
    }
  }

  try {
    const result = await generateLearningPath({
      topic: topic,
      userSkills: MOCK_USER_SKILLS,
    });
    return {
      paths: result.paths,
      error: undefined,
      topic: topic,
    };
  } catch (error) {
    console.error('Error in learningPathGeneratorFlow:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while generating the learning path.';
    return {
      ...prevState,
      error: errorMessage,
      topic: topic,
    };
  }
}
