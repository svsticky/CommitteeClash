'use client';

import { cn } from '@/lib/utils';
import { PossibleTask } from '@/types/PossibleTask';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';

/**
 * PossibleTaskItem component that displays a possible task with its details
 * and provides an option to edit the task.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {PossibleTask} props.possibleTask - The possible task object containing its details.
 * @param {string} [props.className] - Optional additional class names for styling.
 * @returns {JSX.Element} A JSX element that represents a possible task item.
 */
export default function PossibleTaskItem({
  possibleTask,
  className = '',
}: {
  possibleTask: PossibleTask;
  className?: string;
}) {
  // Use Next.js router to navigate to the edit task page
  const router = useRouter();

  // Handle the edit button click to navigate to the edit task page
  const handleEdit = () => {
    router.push(`/Admin/ManageTasks/EditTask?id=${possibleTask.id}`);
  };

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row justify-between bg-gray-100 rounded-sm p-2 gap-2 sm:items-center',
        className
      )}
    >
      {/* Display the task description and points, with a line-through if the task is not active */}
      <div
        className={possibleTask.isActive ? '' : 'line-through text-gray-500'}
      >
        {possibleTask.shortDescription} ({possibleTask.points} punten)
      </div>

      {/* Button to edit the task */}
      <Button size="sm" className="w-full sm:w-auto" onClick={handleEdit}>
        Bewerk
      </Button>
    </div>
  );
}
