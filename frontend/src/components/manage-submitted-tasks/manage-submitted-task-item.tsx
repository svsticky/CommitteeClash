'use client';

import { PossibleTask } from '@/types/PossibleTask';
import { SubmittedTask } from '@/types/SubmittedTask';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';

/**
 * ManageSubmittedTaskItem component that displays a submitted task with its details
 * and provides an option to review or revise the task.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {SubmittedTask} props.submittedTask - The submitted task object containing its details.
 * @param {PossibleTask} props.possibleTask - The possible task object related to the submitted task.
 * @returns {JSX.Element} A JSX element that represents a submitted task item.
 */
export default function ManageSubmittedTaskItem({
  submittedTask,
  possibleTask,
}: {
  submittedTask: SubmittedTask;
  possibleTask: PossibleTask;
}) {
  // Use Next.js router to navigate to the review page for the submitted task
  const router = useRouter();

  return (
    <div className="flex rounded-sm bg-gray-100 p-2 gap-2 flex-col sm:items-center sm:flex-row">
      {/* Display the committee name and task description */}
      <span className="font-semibold">{submittedTask.committee}</span>
      <span className="break-words">{possibleTask.shortDescription}</span>

      {/* Button to review or revise the submitted task */}
      <Button
        size="sm"
        onClick={() =>
          router.push(
            `/Admin/ManageSubmittedTasks/ReviewSubmittedTask?id=${submittedTask.id}`
          )
        }
        className="w-full sm:w-auto sm:ml-auto"
      >
        {submittedTask.status === 'Pending' ? 'Beoordelen' : 'Herzien'}
      </Button>
    </div>
  );
}
