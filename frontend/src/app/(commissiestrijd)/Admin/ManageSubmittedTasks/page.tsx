import { GetPossibleTasks } from '@/actions/possible-task';
import {
  GetApprovedTasks,
  GetPendingTasks,
  GetRejectedTasks,
} from '@/actions/submit-task';
import ManageSubmittedTaskList from '@/components/manage-submitted-tasks/manage-submitted-tasks-list';
import { PossibleTaskList } from '@/types/PossibleTask';

/**
 * ManageSubmittedTasks component that fetches and displays lists of submitted tasks
 * categorized into pending, approved, and rejected tasks.
 *
 * @returns {JSX.Element} A JSX element that contains the management interface for submitted tasks.
 */
export default async function ManageSubmittedTasks() {
  // Fetch the possible tasks from the server
  const res = await GetPossibleTasks();

  // Check if the request was successful
  if (!res.succeed) {
    throw new Error(`Failed to load possible tasks: ${res.error}`);
  }

  // Extract the submitted tasks from the response
  const possibleTasks = res.data as PossibleTaskList;

  return (
    <div className="flex flex-col gap-4">
      {/* Pending task list */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Ingediende opdrachten</h1>
        <ManageSubmittedTaskList
          possibleTasks={possibleTasks}
          getSubmittedTasksAction={GetPendingTasks}
        />
      </div>

      {/* Approved task list */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Goedgekeurde opdrachten</h1>
        <ManageSubmittedTaskList
          possibleTasks={possibleTasks}
          getSubmittedTasksAction={GetApprovedTasks}
        />
      </div>

      {/* Rejected task list */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Afgekeurde opdrachten</h1>
        <ManageSubmittedTaskList
          possibleTasks={possibleTasks}
          getSubmittedTasksAction={GetRejectedTasks}
        />
      </div>
    </div>
  );
}
