import { z } from 'zod';

const LeaderboardItemSchema = z.object({
  committee: z
    .string()
    .min(1, 'Committee is required')
    .max(100, 'Committee must be at most 100 characters long'),
  points: z.number().int().min(0, 'Points must be at least 0'),
});

export type LeaderboardItem = z.infer<typeof LeaderboardItemSchema>;

export const LeaderboardListSchema = z.array(LeaderboardItemSchema);

export type LeaderboardList = z.infer<typeof LeaderboardListSchema>;
