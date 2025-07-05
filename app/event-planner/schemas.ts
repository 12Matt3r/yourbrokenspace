
import { z } from 'zod';
import type { EventPlannerOutput, EventPlannerInput } from '@/ai/flows/event-planner-flow';

export const EventPlannerFormSchema = z.object({
  eventIdea: z.string()
    .min(10, { message: 'Please describe your event idea in at least 10 characters.' })
    .max(300, { message: 'Idea must be 300 characters or less.' }),
  // creatorName will be added on the server-side action
});

export type EventPlannerFormData = z.infer<typeof EventPlannerFormSchema>;

export type EventPlannerFormState = {
  message: string | null;
  fields?: { eventIdea: string }; // Only eventIdea from form
  issues?: string[];
  fieldErrors?: Partial<Record<keyof EventPlannerFormData, string[]>>;
  data?: EventPlannerOutput;
};
