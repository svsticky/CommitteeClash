'use client';

import { LeaderboardList } from '@/types/Leaderboard';
import LeaderboardItemComponent from './leaderboard-item-component';

/**
 * Leaderboard component that displays the leaderboard for a selected period.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {LeaderboardList} props.leaderboard - The leaderboard data to display.
 * @param {string} [props.theme] - Optional theme for styling ('light' or 'dark').
 *
 * @returns {JSX.Element} A JSX element that contains the leaderboard.
 */
export default function LeaderboardComponent({
  leaderboard,
  theme = 'light',
}: {
  leaderboard: LeaderboardList;
  theme?: 'light' | 'dark';
}) {
  // Calculate the maximum score from the leaderboard data
  const maxScore = Math.max(...(leaderboard?.map((item) => item.points) || []));

  return (
    <>
      {/* black background if dark theme */}
      <div className={`w-full h-full ${theme == 'dark' ? 'bg-black' : ''}`}>
        {/* Rounded corners and a dark gray or light gray background based on the theme */}
        <div
          className={`rounded-lg bg-gray-100 p-2 w-full h-full ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}
        >
          {/* Leaderboard title */}
          <h1 className="text-2xl font-bold">Tussenstand</h1>

          {/* Show a message if there are no scores available */}
          {leaderboard.length === 0 && (
            <p className="text-gray-400">
              Er zijn nog geen scores beschikbaar.
            </p>
          )}

          {/* Show the leaderboard items */}
          {leaderboard.length > 0 &&
            leaderboard.map((item) => (
              <LeaderboardItemComponent
                leaderboardItem={item}
                key={item.committee}
                maxScore={maxScore}
              />
            ))}
        </div>
      </div>
    </>
  );
}
