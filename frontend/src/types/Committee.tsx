import { z } from 'zod';

export const CommitteeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export type Committee = z.infer<typeof CommitteeSchema>;

export const CommitteeListSchema = z.array(CommitteeSchema);

export type CommitteeList = z.infer<typeof CommitteeListSchema>;
