import EditPossibleTask from '@/components/manage-possible-tasks/edit-possible-task';
import { FetchWithValidation } from '@/lib/fetchWithValidation';
import { PossibleTaskSchema } from '@/types/PossibleTask';

/**
 * EditTask component that fetches a possible task based on the provided task ID
 * in the search parameters and renders a form to edit the task.
 *
 * @param {Object} props - The component props.
 * @param {Promise<{ id?: string }>} props.searchParams - A promise that resolves to an object containing the task ID.
 * @returns {JSX.Element} A JSX element that contains the edit form for the possible task.
 */
export default async function EditTask({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  // Await the search parameters to get the task ID
  const searchParameters = await searchParams;

  // Check if the task ID is provided in the search parameters
  if (!searchParameters.id) {
    throw new Error('No possible task ID provided in the URL.');
  }

  // Fetch the possible task using the provided task ID
  const response = await FetchWithValidation(
    PossibleTaskSchema,
    `http://backend:8080/PossibleTask/GetPossibleTask?taskId=${encodeURIComponent(searchParameters.id)}`
  );

  // Check if the response was successful, if not throw an error
  if (!response.success) {
    throw new Error(`Failed to fetch possible task: ${response.error}`);
  }

  // Extract the possible task from the response data
  const possibleTask = response.data;

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Bewerk opdracht</h1>
      <EditPossibleTask possibleTask={possibleTask} />
    </>
  );
}
