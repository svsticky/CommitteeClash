import LeaderboardComponent from '@/components/leaderboard/leaderboard-component';
import { FetchWithValidation } from '@/lib/fetchWithValidation';
import { LeaderboardListSchema } from '@/types/Leaderboard';

/**
 * PublicLeaderboardPage component that fetches the leaderboard data for a specific period
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Promise<{ periodName?: string; theme?: 'light' | 'dark' }>} props.searchParams - The search parameters from the URL.
 *
 * @returns {JSX.Element} A JSX element representing the public leaderboard page.
 */
export default async function PublicLeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ periodName?: string; theme?: 'light' | 'dark' }>;
}) {
  // Await the search parameters to get the task ID
  const searchParameters = await searchParams;

  // Show a message if the period name is invalid
  if (!searchParameters.periodName) return <div>Invalid period name</div>;

  // Get period name and theme color from search parameters
  const periodName = searchParameters.periodName;
  const theme = searchParameters.theme || 'light';

  // Load the leaderboard from the backend
  const res = await FetchWithValidation(
    LeaderboardListSchema,
    `http://backend:8080/Leaderboard/GetLeaderboardByPeriodName?periodName=${periodName}`
  );

  // Show a message if it fails
  if (!res.success) {
    console.error('Failed to fetch leaderboard data:', res.error);
    return <div>Failed to fetch leaderboard data</div>;
  }

  const leaderboard = res.data;

  return <LeaderboardComponent leaderboard={leaderboard} theme={theme} />;
}
