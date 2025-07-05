
'use server';

import { suggestCollaborators, type CollaborationSuggesterInput, type CollaborationSuggesterOutput } from '@/ai/flows/collaboration-suggester-flow';

export interface CollaborationSuggestionState {
  message: string | null;
  suggestions?: CollaborationSuggesterOutput['suggestions'];
  error?: string;
  input?: CollaborationSuggesterInput;
}

export async function getCollaborationSuggestionsAction(
  userInput: CollaborationSuggesterInput
): Promise<CollaborationSuggestionState> {
  if (!userInput.userCreationsSummary || userInput.userCreationsSummary.length === 0) {
    return { message: null, error: "Please add some creations to your profile first. The AI needs this to make good suggestions.", input: userInput };
  }
  if (!userInput.userSkills || userInput.userSkills.length === 0) {
     return { message: null, error: "Please add some skills to your profile first so the AI can find complementary collaborators.", input: userInput };
  }
  if (!userInput.userInterests || userInput.userInterests.length === 0) {
     return { message: null, error: "Please add some interests/vibe tags to your profile first to help the AI find like-minded creators.", input: userInput };
  }

  try {
    const result = await suggestCollaborators(userInput);
    return {
      message: 'Successfully generated collaboration suggestions!',
      suggestions: result.suggestions,
      input: userInput,
    };
  } catch (error) {
    console.error('Error in suggestCollaborators flow:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while generating suggestions.';
    return {
      message: null,
      error: errorMessage,
      input: userInput,
    };
  }
}
