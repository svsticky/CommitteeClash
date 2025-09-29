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
  theme?: 'light' | 'dark' | 'radio'; // Radio theme has hardcoded values so this graph looks good on radio.svsticky.nl
}) {
  // Calculate the maximum score from the leaderboard data
  const maxScore = Math.max(...(leaderboard?.map((item) => item.points) || []));

  function backgroundColor(theme: string) {
    switch(theme) {
      case 'light': return 'bg-gray-100'
      case 'dark': return 'bg-gray-800 text-white'
      case 'radio': return 'bg-[#262626] text-white'
    }
  }

  return (
    <>
      {/* black background if dark theme */}
      <div className={`w-full h-full`}>
        {/* Rounded corners and a dark gray or light gray background based on the theme */}
        <div
          className={`${theme === 'radio' ? '' : 'rounded-lg'} p-2 w-full h-full ${backgroundColor(theme)}`}
        >
          {/* Leaderboard title */}
          <h1 className="text-3xl font-semibold pb-10">Tussenstand</h1>

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
