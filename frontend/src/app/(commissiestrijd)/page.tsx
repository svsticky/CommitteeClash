import LeaderboardComponent from '@/components/leaderboard/leaderboard-component';
import { FetchWithValidation } from '@/lib/fetchWithValidation';
import { PeriodList, PeriodListSchema } from '@/types/Period';

/**
 * Home component that fetches a list of periods from the backend
 * and renders a leaderboard component with the filtered periods.
 *
 * @returns {JSX.Element} A JSX element that contains the leaderboard interface.
 */
export default async function Home() {
  // Fetch the list of periods from the backend using the FetchWithValidation function
  // and validate the response against the PeriodListSchema.
  const res = await FetchWithValidation(
    PeriodListSchema,
    'http://backend:8080/Period/GetPeriods'
  );

  // Check if the response was successful, if not throw an error
  // with a message that includes the error from the response.
  if (!res.success) {
    throw new Error(`Failed to load periods: ${res.error}`);
  }

  // Get the current date in the Netherlands time zone
  const nowInNL = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Amsterdam',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  // Filter the periods to only include those that have started
  const periods = (res.data as PeriodList).filter(
    (period) => period.startDate.split('T')[0] <= nowInNL
  );

  return (
    <div className="flex flex-col items-center w-full">
      <LeaderboardComponent periods={periods} />
    </div>
  );
}
