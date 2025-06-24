import SubmittedTasksClient from '@/components/submitted-tasks-client';
import { FetchWithValidation } from '@/lib/fetchWithValidation';
import { CommitteeListSchema } from '@/types/Committee';
import { PossibleTaskListSchema } from '@/types/PossibleTask';

/**
 * SubmittedTask component that fetches a list of committees and possible tasks,
 * and renders a client component to display submitted tasks.
 *
 * @returns {JSX.Element} A JSX element that contains the submitted tasks interface.
 */
export default async function SubmittedTask() {
  // Fetch the list of committees from the backend using the FetchWithValidation function
  // and validate the response against the CommitteeListSchema.
  const committeeRes = await FetchWithValidation(
    CommitteeListSchema,
    'http://backend:8080/Committee/GetCommittees'
  );

  // Fetch the list of possible tasks from the backend using the FetchWithValidation function
  // and validate the response against the PossibleTaskListSchema.
  const possibleTasksRes = await FetchWithValidation(
    PossibleTaskListSchema,
    'http://backend:8080/PossibleTask/GetPossibleTasks'
  );

  // Check if any of the responses were unsuccessful, if so throw an error
  // with a message that includes the error from the response.
  if (!committeeRes.success || !possibleTasksRes.success) {
    throw new Error(
      `Failed to load committees or possible tasks: ${committeeRes.error || possibleTasksRes.error}`
    );
  }

  // Extract the data from the responses
  // and assign them to the respective variables.
  const committees = committeeRes.data;
  const possibleTasks = possibleTasksRes.data;

  return (
    <SubmittedTasksClient
      committees={committees}
      possibleTasks={possibleTasks}
    />
  );
}
