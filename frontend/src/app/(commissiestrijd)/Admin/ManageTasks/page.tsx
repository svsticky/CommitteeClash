import PossibleTaskItem from '@/components/manage-possible-tasks/possible-task-item';
import { FetchWithValidation } from '@/lib/fetchWithValidation';
import { PossibleTaskListSchema } from '@/types/PossibleTask';
import { Plus } from 'lucide-react';
import Link from 'next/link';

/**
 * ManageTasks component that fetches a list of possible tasks from the backend
 * and renders them in a list with an option to create a new task.
 *
 * @returns {JSX.Element} A JSX element that contains the management interface for possible tasks.
 */
export default async function ManageTasks() {
  // Fetch the list of possible tasks from the backend using the FetchWithValidation function
  const res = await FetchWithValidation(
    PossibleTaskListSchema,
    'http://backend:8080/PossibleTask/GetPossibleTasks'
  );

  // Check if the response was successful, if not throw an error
  if (!res.success) {
    throw new Error(`Failed to load possible tasks: ${res.error}`);
  }

  // Extract the possible tasks from the response data
  const tasks = res.data;

  return (
    <>
      <div className="flex justify-between w-full mb-4">
        {/* Title */}
        <h1 className="text-2xl font-bold">Opdrachten</h1>

        {/* Button to create a new task */}
        <Link
          className="px-2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-theme text-primary-foreground shadow-xs hover:bg-theme/90 cursor-pointer disabled:cursor-default"
          href="/Admin/ManageTasks/CreateTask"
        >
          <Plus />
        </Link>
      </div>

      {/* List with existing possible tasks */}
      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <PossibleTaskItem possibleTask={task} key={task.id} />
        ))}
      </div>

      {/* If no tasks, show message */}
      {tasks.length === 0 && (
        <p className="text-gray-500">Er zijn geen opdrachten.</p>
      )}
    </>
  );
}
