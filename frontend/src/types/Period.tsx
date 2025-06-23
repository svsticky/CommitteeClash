import { z } from 'zod';

export const PeriodSchema = z.object({
  id: z.string().uuid('Invalid committee ID format'),
  name: z.string().min(1, 'Name is required'),
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
});

export type Period = z.infer<typeof PeriodSchema>;

export const PeriodListSchema = z.array(PeriodSchema);

export type PeriodList = z.infer<typeof PeriodListSchema>;
