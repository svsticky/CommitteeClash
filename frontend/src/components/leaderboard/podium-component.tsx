import { cn } from '@/lib/utils';
import { LeaderboardList } from '@/types/Leaderboard';

/**
 * Podium component that displays the top three committees in the leaderboard.
 * It shows the committee names and their respective points, along with podium emojis.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {LeaderboardList} props.leaderboard - The leaderboard data containing committee names and points.
 * @param {string} [props.className] - Optional additional class names for styling.
 * @returns {JSX.Element} A JSX element that represents the podium display.
 */
export default function Podium({
  leaderboard,
  className = '',
}: {
  leaderboard: LeaderboardList;
  className?: string;
}) {
  return (
    <>
      <div className={cn('w-full text-center', className)}>
        {/* Title and subtitle */}
        <h1 className="text-2xl font-bold">Top commissies</h1>
        <p>Bekijk de commissies met de hoogste score</p>

        {/* Podium display for the top three committees */}
        <div className="flex justify-center mt-4 gap-2">
          {/* Podium display for the number two */}
          <div className="rounded-lg bg-gray-100 p-2 px-5 mt-15 w-2/5">
            <p className="text-3xl">🥈</p>
            <p className="break-all">
              {leaderboard[1] ? leaderboard[1].committee : '-'}
            </p>
            <p className="text-gray-500">
              {leaderboard[1] ? leaderboard[1].points : 0}
            </p>
          </div>

          {/* Podium display for the number one */}
          <div className="rounded-lg bg-gray-100 p-2 px-5 mb-15  w-2/5">
            <p className="text-3xl">🥇</p>
            <p className="break-all">
              {leaderboard.length > 0 ? leaderboard[0].committee : '-'}
            </p>
            <p className="text-gray-500">
              {leaderboard.length > 0 ? leaderboard[0].points : 0}
            </p>
          </div>

          {/* Podium display for the number three */}
          <div className="rounded-lg bg-gray-100 p-2 px-5 mt-15  w-2/5">
            <p className="text-3xl">🥉</p>
            <p className="break-all">
              {leaderboard[2] ? leaderboard[2].committee : '-'}
            </p>
            <p className="text-gray-500">
              {leaderboard[2] ? leaderboard[2].points : 0}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
