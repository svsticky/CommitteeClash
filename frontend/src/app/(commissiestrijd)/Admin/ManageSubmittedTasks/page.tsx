import ManageSubmittedTaskList from '@/components/manage-submitted-tasks/manage-submitted-tasks-list';
import { FetchWithValidation } from '@/lib/fetchWithValidation';
import { SubmittedTaskListSchema } from '@/types/SubmittedTask';

/**
 * ManageSubmittedTasks component that fetches and displays lists of submitted tasks
 * categorized into pending, approved, and rejected tasks.
 *
 * @returns {JSX.Element} A JSX element that contains the management interface for submitted tasks.
 */
export default async function ManageSubmittedTasks() {
  // Fetch the lists of pending tasks from the backend using the FetchWithValidation function
  const pendingRes = await FetchWithValidation(
    SubmittedTaskListSchema,
    'http://backend:8080/SubmittedTask/GetPendingTasks'
  );

  // Fetch the lists of approved tasks from the backend using the FetchWithValidation function
  const approvedRes = await FetchWithValidation(
    SubmittedTaskListSchema,
    'http://backend:8080/SubmittedTask/GetApprovedTasks'
  );

  // Fetch the lists of rejected tasks from the backend using the FetchWithValidation function
  const rejectedRes = await FetchWithValidation(
    SubmittedTaskListSchema,
    'http://backend:8080/SubmittedTask/GetRejectedTasks'
  );

  // Check if any of the responses were unsuccessful, if so throw an error
  if (!pendingRes.success || !approvedRes.success || !rejectedRes.success) {
    throw new Error(
      `Failed to load possible tasks: ${pendingRes.error ? pendingRes.error : approvedRes.error ? approvedRes.error : rejectedRes.error}`
    );
  }

  // Extract the lists of tasks from the response data
  const pendingTasks = pendingRes.data;
  const approvedTasks = approvedRes.data;
  const rejectedTasks = rejectedRes.data;

  return (
    <div className="flex flex-col gap-4">
      {/* Pending task list */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Ingediende opdrachten</h1>
        <ManageSubmittedTaskList submittedTasks={pendingTasks} />
      </div>

      {/* Approved task list */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Goedgekeurde opdrachten</h1>
        <ManageSubmittedTaskList submittedTasks={approvedTasks} />
      </div>

      {/* Rejected task list */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Afgekeurde opdrachten</h1>
        <ManageSubmittedTaskList submittedTasks={rejectedTasks} />
      </div>
    </div>
  );
}
