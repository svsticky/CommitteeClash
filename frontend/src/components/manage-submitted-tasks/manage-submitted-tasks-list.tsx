import { GetPossibleTasks } from '@/actions/possible-task';
import { PossibleTask, PossibleTaskList } from '@/types/PossibleTask';
import { SubmittedTaskList } from '@/types/SubmittedTask';
import ManageSubmittedTaskItem from './manage-submitted-task-item';

/**
 * ManageSubmittedTaskList component that displays a list of submitted tasks
 * along with their possible tasks, allowing for management actions.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {SubmittedTaskList} props.submittedTasks - The list of submitted tasks to display.
 * @returns {JSX.Element} A JSX element that represents the list of submitted tasks.
 */
export default async function ManageSubmittedTaskList({
  submittedTasks,
}: {
  submittedTasks: SubmittedTaskList;
}) {
  // Fetch the possible tasks from the server
  const res = await GetPossibleTasks();

  // Check if the request was successful
  if (!res.succeed) {
    throw new Error(`Failed to load possible tasks: ${res.error}`);
  }

  // Extract the submitted tasks from the response
  const possibleTasks = res.data as PossibleTaskList;

  return (
    <>
      {/* List the possible tasks */}
      <div className="flex flex-col gap-2">
        {submittedTasks.map((task) => (
          <ManageSubmittedTaskItem
            key={task.id}
            submittedTask={task}
            possibleTask={
              possibleTasks.find(
                (pt) => pt.id === task.possibleTaskId
              ) as PossibleTask
            }
          />
        ))}
      </div>

      {/* Display a message if there are no submitted tasks */}
      {submittedTasks.length === 0 && (
        <p className="text-gray-500">Er zijn geen opdrachten.</p>
      )}
    </>
  );
}
