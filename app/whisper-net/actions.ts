
'use server';

import { visualSearch, type VisualSearchInput, type VisualSearchOutput } from '@/ai/flows/visual-search-flow';

export interface WhisperNetState {
  data?: VisualSearchOutput;
  error?: string;
  query?: string;
}

export async function getVisualSearchAction(query: string): Promise<WhisperNetState> {
  if (!query || query.trim().length < 2) {
    return { error: 'Search query must be at least 2 characters long.', query };
  }
  
  const input: VisualSearchInput = { query };

  try {
    const result = await visualSearch(input);
    return {
      data: result,
      query,
    };
  } catch (error) {
    console.error('Error in visualSearch flow:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      error: errorMessage,
      query,
    };
  }
}
