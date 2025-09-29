import { cn } from '@/lib/utils';
import { LeaderboardItem as LeaderboardItemComponent } from '@/types/Leaderboard';
import Scorebar from './scorebar-component';

/**
 * LeaderboardItem component that displays a single item in the leaderboard.
 * It shows the committee name, score as a percentage of the maximum score,
 * and the total points scored by the committee.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {LeaderboardItemComponent} props.leaderboardItem - The leaderboard item data to display.
 * @param {number} props.maxScore - The maximum score used to calculate the percentage.
 * @param {string} [props.theme] - Optional theme for styling ('light' or 'dark').
 * @param {string} [props.className] - Optional additional class names for styling.
 *
 * @returns {JSX.Element} A JSX element that represents a single leaderboard item.
 */
export default function LeaderboardItem({
  leaderboardItem,
  maxScore,
  theme = 'light',
  className = '',
}: {
  leaderboardItem: LeaderboardItemComponent;
  maxScore: number;
  theme?: 'light' | 'dark';
  className?: string;
}) {
  return (
    <div className={cn('flex items-center', className)}>
      <div className="w-full flex flex-col sm:flex-row sm:items-center">
        {/* Display the committee name with a minimum width for consistency */}
        <h2 className="text-xl font-semibold min-w-[180px]">
          {leaderboardItem.committee}
        </h2>

        <div className="flex w-full">
          {/* Display the score bar */}
          <Scorebar
            className="mx-4 mt-2 mb-2 flex-1"
            score={(leaderboardItem.points / maxScore) * 100}
          />

          {/* Display the points scored by the committee */}
          <div className="w-15 text-right content-center">
            <span className="text-xl font-bold">{leaderboardItem.points}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
