
'use server';

import { planEvent, type EventPlannerInput } from '@/ai/flows/event-planner-flow';
import type { EventPlannerFormState } from './schemas';
import { EventPlannerFormSchema } from './schemas';
import type { YourSpaceEvent } from '@/config/eventsData';
import { addEvent } from '@/lib/firebase/firestoreService';
import { revalidatePath } from 'next/cache';

// This action is for the AI suggestion part
export async function getEventPlanAction(
  prevState: EventPlannerFormState,
  formData: FormData
): Promise<EventPlannerFormState> {
  
  const rawFormData = {
    eventIdea: formData.get('eventIdea'),
  };

  const validatedFields = EventPlannerFormSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      message: 'Validation failed. Please check your inputs.',
      issues: validatedFields.error.flatten().formErrors,
      fieldErrors: validatedFields.error.flatten().fieldErrors,
      fields: { eventIdea: formData.get('eventIdea')?.toString() ?? '' },
      data: undefined,
    };
  }

  const creatorName = "Creative User"; // This would come from session in a real app
  const inputData: EventPlannerInput = {
    ...validatedFields.data,
    creatorName,
  };

  try {
    const result = await planEvent(inputData);
    return {
      message: 'Successfully generated your event plan!',
      data: result,
      issues: undefined,
      fieldErrors: undefined,
      fields: undefined, // Clear fields on success
    };
  } catch (error) {
    console.error('Error in eventPlannerFlow:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while planning the event.';
    return {
      message: 'An error occurred. Please try again.',
      data: undefined,
      issues: [errorMessage],
      fieldErrors: undefined,
      fields: validatedFields.data, // Keep fields populated on error
    };
  }
}

// This action is for publishing the event to Firestore
export async function publishEventAction(eventData: Omit<YourSpaceEvent, 'id' | 'createdAt' | 'rsvps'>): Promise<{ success: boolean; error?: string; eventId?: string }> {
  try {
    const eventToSave = {
        ...eventData,
        rsvps: 0,
    };
    const eventId = await addEvent(eventToSave);
    revalidatePath('/events'); // Invalidate cache for the events page
    return { success: true, eventId };
  } catch (error) {
    console.error("Error publishing event:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}
