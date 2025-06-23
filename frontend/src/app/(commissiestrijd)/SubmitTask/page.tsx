import TaskForm from '@/components/task-form';
import { FetchWithValidation } from '@/lib/fetchWithValidation';
import { CommitteeListSchema } from '@/types/Committee';
import { PossibleTaskListSchema } from '@/types/PossibleTask';

/**
 * SubmitTask component that fetches a list of possible tasks and committees,
 * and renders a form to submit a task.
 *
 * @returns {JSX.Element} A JSX element that contains the task submission interface.
 */
export default async function SubmitTask() {
  // Fetch the list of committees from the backend using the FetchWithValidation function
  // and validate the response against the CommitteeListSchema.
  const committeesRes = await FetchWithValidation(
    CommitteeListSchema,
    'http://backend:8080/Committee/GetCommittees'
  );

  // Fetch the list of possible tasks from the backend using the FetchWithValidation function
  // and validate the response against the PossibleTaskListSchema.
  const taskRes = await FetchWithValidation(
    PossibleTaskListSchema,
    'http://backend:8080/PossibleTask/GetActivePossibleTasks'
  );

  // Check if any of the responses were unsuccessful, if so throw an error
  // with a message that includes the error from the response.
  if (!taskRes.success || !committeesRes.success) {
    throw new Error(
      `Failed to load tasks or committees: ${taskRes.error || committeesRes.error}`
    );
  }

  // Extract the data from the responses
  // and assign them to the respective variables.
  const possibleTasks = taskRes.data;
  const committees = committeesRes.data;

  return (
    <>
      {/* Title for the task submission page */}
      <h1 className="text-2xl font-bold">Opdrachten</h1>

      {/* Message if there are no tasks */}
      {possibleTasks.length === 0 ? (
        <p className="text-gray-500">
          Er zijn momenteel geen actieve opdrachten.
        </p>
      ) : (
        // If there are tasks, show a list of them
        possibleTasks.map((task, index) => (
          <p key={index}>
            {index + 1}. {task.description}
            {task.maxPerPeriod &&
              task.maxPerPeriod !== null &&
              `Maximaal ${task.maxPerPeriod} keer`}{' '}
            ({task.points} punten)
          </p>
        ))
      )}

      {/* Form to submit a task */}
      <h1 className="text-2xl font-bold my-4">Opdracht indienen</h1>
      <TaskForm tasks={possibleTasks} committees={committees} />
    </>
  );
}
