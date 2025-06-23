import { cn } from '@/lib/utils';
import { PossibleTaskList } from '@/types/PossibleTask';
import { SubmittedTaskList } from '@/types/SubmittedTask';
import TaskManageListItem from './task-status-list-item';

/**
 * TaskManageList component that displays a list of submitted tasks
 * and their possible tasks, allowing for management actions.
 *
 * @param {Object} props - The properties passed to the component.
 * @returns {JSX.Element} A JSX element that represents the list of submitted tasks.
 */
export default function TaskManageList({
  submittedTasks = [],
  possibleTasks = [],
  className = '',
}: {
  submittedTasks?: SubmittedTaskList;
  possibleTasks?: PossibleTaskList;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-1 justify-center w-full items-center">
      {/* List the submitted tasks */}
      {submittedTasks.length > 0 ? (
        submittedTasks.map((submittedTask, index) => {
          return (
            <TaskManageListItem
              key={index}
              submittedTask={submittedTask}
              possibleTask={possibleTasks.find(
                (t) => t.id === submittedTask.possibleTaskId
              )}
              className={cn('flex w-full', className)}
            />
          );
        })
      ) : (
        // Display a message if there are no submitted tasks
        <p className="text-s text-gray-500">
          Geen ingediende opdrachten gevonden.
        </p>
      )}
    </div>
  );
}
