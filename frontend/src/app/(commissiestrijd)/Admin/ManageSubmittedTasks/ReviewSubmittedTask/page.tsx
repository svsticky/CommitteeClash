import ReviewSubmittedTaskForm from '@/components/review-form';
import { FetchWithValidation } from '@/lib/fetchWithValidation';
import { PossibleTaskSchema } from '@/types/PossibleTask';
import { SubmittedTask, SubmittedTaskSchema } from '@/types/SubmittedTask';

/**
 * ReviewSubmittedTask component that fetches a submitted task and its possible task
 * based on the provided task ID in the search parameters, and renders a review form.
 *
 * @param {Object} props - The component props.
 * @param {Promise<{ id?: string }>} props.searchParams - A promise that resolves to an object containing the task ID.
 * @returns {JSX.Element} A JSX element that contains the review form for the submitted task.
 */
export default async function ReviewSubmittedTask({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  // Await the search parameters to get the task ID
  const searchParameters = await searchParams;

  // Check if the task ID is provided in the search parameters
  if (!searchParameters.id) {
    throw new Error('No task ID provided in search parameters.');
  }

  // Fetch the submitted task using the provided task ID
  const submittedTaskRes = await FetchWithValidation(
    SubmittedTaskSchema,
    `http://backend:8080/SubmittedTask/GetSubmittedTask?taskId=${searchParameters.id}`
  );

  // Check if the response was successful, if not throw an error
  if (!submittedTaskRes.success) {
    throw new Error(
      `Failed to fetch task with ID ${searchParameters.id}: ${submittedTaskRes.error}`
    );
  }

  // Extract the submitted task from the response data
  const submittedTask = submittedTaskRes.data as SubmittedTask;

  // Fetch the possible task associated with the submitted task
  const possibleTaskRes = await FetchWithValidation(
    PossibleTaskSchema,
    `http://backend:8080/PossibleTask/GetPossibleTask?taskId=${submittedTask.possibleTaskId}`
  );

  // Check if the response for the possible task was successful, if not throw an error
  if (!possibleTaskRes.success) {
    throw new Error(
      `Failed to fetch possible task with ID ${submittedTask.possibleTaskId}: ${possibleTaskRes.error}`
    );
  }

  // Extract the possible task from the response data
  const possibleTask = possibleTaskRes.data;

  // Format the submitted task's submission date to a readable string
  submittedTask.submittedAt = new Date(
    submittedTask.submittedAt
  ).toLocaleString();

  return (
    <ReviewSubmittedTaskForm
      submittedTask={submittedTask}
      possibleTask={possibleTask}
    />
  );
}
