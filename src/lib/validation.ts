import { z } from 'zod';

/**
 * Chat request validation schema for NE-Mitra AI.
 * Enforces bounded messages and optional page context metadata.
 */
export const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system', 'model', 'ai']),
        content: z.string().min(1, 'Message content cannot be empty').max(2000, 'Message exceeds 2000 character limit'),
      })
    )
    .min(1, 'At least one message is required'),
  pageContext: z
    .object({
      route: z.string().optional(),
      state: z.string().optional(),
      placeName: z.string().optional(),
    })
    .optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

/**
 * Document checklist upsert schema for permit and gear tracking.
 */
export const checklistUpsertSchema = z.object({
  tripLabel: z.string().min(1, 'Trip label is required').max(100, 'Trip label is too long'),
  permitType: z.string().min(1, 'Permit type is required').max(50, 'Permit type is too long'),
  items: z
    .array(
      z.object({
        id: z.string(),
        label: z.string().min(1),
        category: z.string(),
        required: z.boolean(),
        checked: z.boolean(),
      })
    )
    .min(1, 'At least one checklist item is required'),
});

export type ChecklistUpsert = z.infer<typeof checklistUpsertSchema>;

/**
 * Itinerary save schema matching the actionable NE-Mitra card protocol.
 */
export const itinerarySaveSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150, 'Title is too long'),
  states: z.array(z.string()).min(1, 'At least one state is required'),
  days: z.number().int().min(1, 'Minimum 1 day').max(60, 'Maximum 60 days'),
  totalBudgetINR: z.number().int().nonnegative('Budget must be positive or zero'),
  permitsSummary: z.string().nullable().optional(),
  dayByDay: z
    .array(
      z.object({
        day: z.number().int().min(1),
        title: z.string().min(1),
        costINR: z.number().int().nonnegative(),
        transportTip: z.string().default(''),
      })
    )
    .min(1, 'At least one day itinerary is required'),
});

export type ItinerarySave = z.infer<typeof itinerarySaveSchema>;
