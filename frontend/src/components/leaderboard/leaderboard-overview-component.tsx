'use client';

import { GetLeaderboard } from '@/actions/leaderboard';
import { LeaderboardList } from '@/types/Leaderboard';
import { PeriodList } from '@/types/Period';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import DropDown from '../ui/drop-down';
import LeaderboardComponent from './leaderboard-component';
import Podium from './podium-component';

/**
 * LeaderboardOverview component that displays a period dropdown, the leaderboard for a selected
 * period and a podium for a selected period.
 * It fetches the leaderboard data from the backend and allows users to select different periods.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {PeriodList} props.periods - The list of periods available for selection.
 *
 * @returns {JSX.Element} A JSX element that contains the leaderboard, podium and a dropdown to select periods.
 */
export default function LeaderboardOverviewComponent({
  periods,
}: {
  periods: PeriodList;
}) {
  // State to hold the leaderboard data
  const [leaderboard, setLeaderboard] = useState<LeaderboardList>([]);

  // State to manage loading state
  const [isLoading, setIsLoading] = useState(true);

  // Extract period names from the periods array for the dropdown
  const periodNames = periods.map((period) => period.name);

  // Set selected period based on URL search params or default to the first period
  // If the period in the URL is not valid, default to the first period
  // If no periods are available, set selectedPeriod to null
  const searchParams = useSearchParams();
  const initialPeriod = searchParams.get('period') || periods[0]?.name || null;
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(
    initialPeriod && periodNames.includes(initialPeriod)
      ? initialPeriod
      : periodNames[0] || null
  );
  const isFirstRender = useRef(true);

  // Fetch the leaderboard data when the component mounts or when selectedPeriod changes
  useEffect(() => {
    // If no periods are available, set loading to false and return
    if (periods.length === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Function to fetch the leaderboard data
    const fetchLeaderboard = async () => {
      // If the selected period does not exist in the periods array, throw an error
      const selected = periods.find((period) => period.name === selectedPeriod);

      if (!selected) {
        throw new Error('Selected period not found');
      }

      // Fetch the leaderboard data for the selected period
      const res = await GetLeaderboard(selected);

      // If the response is not successful, throw an error
      if (!res.succeed) {
        throw new Error('Failed to fetch leaderboard');
      }

      // Set the leaderboard data and calculate the maximum score
      const leaderboardList = res.data as LeaderboardList;
      setLeaderboard(leaderboardList);
    };

    // Call the function to fetch the leaderboard data
    fetchLeaderboard();

    // Set loading to false after fetching the data
    setIsLoading(false);
  }, [selectedPeriod, periods]);

  // Update the URL when the selected period changes
  const router = useRouter();
  useEffect(() => {
    if (!selectedPeriod) return;

    // If this is the first render, skip updating the URL
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const params = new URLSearchParams();

    params.set('period', selectedPeriod);

    router.replace(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });
  }, [selectedPeriod, router]);

  return (
    <>
      {/* Dropdown to select the period */}
      {periods.length > 0 && (
        <DropDown
          options={periodNames}
          setSelected={(selected) => setSelectedPeriod(selected)}
          selected={selectedPeriod ?? ''}
          title="Selecteer periode"
          className="mb-4"
          disabled={isLoading}
        />
      )}

      {/* If there are no periods, show a message indicating that no "commissiestrijd" has been started */}
      {periods.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400">
            Er is nog geen commissiestrijd opgestart.
          </p>
        </div>
      ) : /* Show if loading */
      isLoading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400">Laden...</p>
        </div>
      ) : (
        /* If loaded, show the leaderboard */
        <>
          {/* The podium */}
          <Podium className="max-w-200 mt-10" leaderboard={leaderboard} />

          {/* The leaderboard */}
          <LeaderboardComponent leaderboard={leaderboard} />
        </>
      )}
    </>
  );
}
