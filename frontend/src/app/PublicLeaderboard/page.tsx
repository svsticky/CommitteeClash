import LeaderboardComponent from '@/components/leaderboard/leaderboard-component';
import { FetchWithValidation } from '@/lib/fetchWithValidation';
import { LeaderboardListSchema } from '@/types/Leaderboard';

/**
 * PublicLeaderboardPage component that fetches the leaderboard data for a specific period
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Object} props.searchParams - The search parameters from the URL.
 * @param {string} [props.searchParams.periodName] - The name of the period to fetch.
 * @param {string} [props.searchParams.theme] - The theme color for the leaderboard.
 *
 * @returns {JSX.Element} A JSX element representing the public leaderboard page.
 */
export default async function PublicLeaderboardPage({
  searchParams,
}: {
  searchParams: { periodName?: string; theme?: 'light' | 'dark' };
}) {
  // Show a message if the period name is invalid
  if (!searchParams.periodName) return <div>Invalid period name</div>;

  // Get period name and theme color from search parameters
  const periodName = searchParams.periodName;
  const theme = searchParams.theme || 'light';

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
