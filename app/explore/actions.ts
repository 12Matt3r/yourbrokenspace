
'use server';

import { smartSearch, type SmartSearchInput } from '@/ai/flows/smart-search-flow';
import { getRecommendationReason, type RecommendationReasonInput, type RecommendationReasonOutput } from '@/ai/flows/recommendation-reason-flow';


export interface SmartSearchState {
  category?: string;
  primaryTag?: string;
  error?: string;
}

export async function getSmartSearchFiltersAction(
  query: string,
  availableTags: string[],
): Promise<SmartSearchState> {
   if (!query.trim()) {
    return { error: 'Search query cannot be empty.' };
  }
  
  const input: SmartSearchInput = { query, availableTags };

  try {
    const result = await smartSearch(input);
    return {
      category: result.category,
      primaryTag: result.primaryTag,
    };
  } catch (error) {
    console.error('Error in smartSearch flow:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown AI error occurred.';
    return {
      error: errorMessage,
    };
  }
}

export async function getRecommendationReasonAction(
  input: RecommendationReasonInput
): Promise<RecommendationReasonOutput | { error: string }> {
  try {
    const result = await getRecommendationReason(input);
    return result;
  } catch (error) {
    console.error('Error in getRecommendationReason flow:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown AI error occurred while generating recommendation reason.';
    return { error: errorMessage };
  }
}
