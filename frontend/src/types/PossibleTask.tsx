import { z } from 'zod';

export const PossibleTaskSchema = z.object({
  id: z.string().uuid(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be at most 500 characters long'),
  shortDescription: z
    .string()
    .min(1, 'Short description is required')
    .max(50, 'Short description must be at most 50 characters long'),
  points: z.number().int().min(1, 'Points must be at least 1'),
  isActive: z.boolean(),
  maxPerPeriod: z
    .number()
    .int()
    .min(1, 'Max amount for this task per period must be at least 1')
    .optional()
    .nullable(),
});

export type PossibleTask = z.infer<typeof PossibleTaskSchema>;

export const PossibleTaskListSchema = z.array(PossibleTaskSchema);

export type PossibleTaskList = z.infer<typeof PossibleTaskListSchema>;
