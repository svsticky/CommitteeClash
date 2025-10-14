import { cn } from '@/lib/utils';
import { PossibleTask } from '@/types/PossibleTask';
import { SubmittedTask } from '@/types/SubmittedTask';

/**
 * TaskStatusListItem component that displays a submitted task with its details
 * and the status of the task.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {SubmittedTask} props.submittedTask - The submitted task object containing its details.
 * @param {PossibleTask} [props.possibleTask] - The possible task object related to the submitted task.
 * @param {string} [props.className] - Optional additional class names for styling.
 * @returns {JSX.Element} A JSX element that represents a submitted task item.
 */
export default function TaskStatusListItem({
  submittedTask,
  possibleTask = undefined,
  className = '',
}: {
  submittedTask: SubmittedTask;
  possibleTask?: PossibleTask;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col w-full rounded-sm bg-gray-100 p-2',
        className
      )}
    >
      {/* Display the task description, points, submissiontime, and task status */}
      <div className="flex flex-col sm:flex-row justify-between w-full gap-2">
        <div className="flex items-start gap-5">
          <p className="text-s font-bold whitespace-break-spaces">
            {possibleTask?.shortDescription}
          </p>
        </div>
        <p className="text-s whitespace-nowrap">
          ({submittedTask.points} punten)
        </p>
        <p className="text-s sm:ml-auto whitespace-nowrap">
          {new Date(submittedTask.submittedAt).toLocaleDateString()}
        </p>
        <p className="text-s whitespace-nowrap">{submittedTask.status}</p>
      </div>

      {/* Display the rejection reason if rejected */}
      {submittedTask.status === 'Rejected' && (
        <p className="whitespace-break-spaces">
          Reden van afkeuren: {submittedTask.rejectionReason}
        </p>
      )}
    </div>
  );
}
