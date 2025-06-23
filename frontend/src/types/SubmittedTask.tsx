import { z } from 'zod';

export const SubmittedTaskSchema = z.object({
  id: z.string().uuid(),
  possibleTaskId: z.string().uuid(),
  submittedAt: z.string().datetime(),
  committee: z
    .string()
    .min(1, 'Committee name must be at least 1 character long')
    .max(100, 'Committee name must be at most 100 characters long'),
  imagePath: z.string(),
  status: z.enum(['Pending', 'Approved', 'Rejected']),
  points: z.number().int().min(1, 'Points must be at least 1'),
  rejectionReason: z
    .string()
    .max(500, 'Rejection reason must be at most 500 characters long')
    .optional()
    .nullable(),
  maxPerPeriod: z
    .number()
    .int()
    .min(1, 'Max amount for this task per period must be at least 1')
    .optional()
    .nullable(),
});

export type SubmittedTask = z.infer<typeof SubmittedTaskSchema>;

export const SubmittedTaskListSchema = z.array(SubmittedTaskSchema);

export type SubmittedTaskList = z.infer<typeof SubmittedTaskListSchema>;
