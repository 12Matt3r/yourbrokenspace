
'use server';

import { chatWithMentor, type MentorChatInput, type MentorChatOutput } from '@/ai/flows/mentor-chat-flow';
import { generateCreativeQuests, type QuestGeneratorInput, type QuestGeneratorOutput } from '@/ai/flows/quest-generator-flow';


export interface MentorChatState {
  response?: string;
  error?: string;
}

export async function getMentorResponseAction(
  userInput: MentorChatInput
): Promise<MentorChatState> {
  if (!userInput.trim()) {
    return { error: "Message cannot be empty." };
  }

  try {
    const result = await chatWithMentor(userInput);
    return {
      response: result.response,
    };
  } catch (error) {
    console.error('Error in chatWithMentor flow:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while talking to the Mentor AI.';
    return {
      error: errorMessage,
    };
  }
}

export interface AIQuestsState {
  quests?: QuestGeneratorOutput['quests'];
  error?: string;
}

export async function getAIQuestsAction(
  userInput: QuestGeneratorInput
): Promise<AIQuestsState> {
  if (!userInput.userSkills || userInput.userSkills.length === 0) {
    return { error: "Please add some skills to your profile first so the AI can generate relevant quests." };
  }
  if (!userInput.userInterests || userInput.userInterests.length === 0) {
     return { error: "Please add some interests to your profile first to help the AI tailor your quests." };
  }

  try {
    const result = await generateCreativeQuests(userInput);
    return {
      quests: result.quests,
    };
  } catch (error) {
    console.error('Error in generateCreativeQuests flow:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while generating quests.';
    return {
      error: errorMessage,
    };
  }
}
