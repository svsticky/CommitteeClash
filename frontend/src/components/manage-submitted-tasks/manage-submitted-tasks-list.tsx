'use client';

import { PossibleTask, PossibleTaskList } from '@/types/PossibleTask';
import { Response } from '@/types/Response';
import { SubmittedTaskList } from '@/types/SubmittedTask';
import { useEffect, useState } from 'react';
import PagedListFooterComponent from '../paged-list-footer';
import ManageSubmittedTaskItem from './manage-submitted-task-item';

/**
 * ManageSubmittedTaskList component that displays a list of submitted tasks
 * along with their possible tasks, allowing for management actions.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Function} props.getSubmittedTasksAction - The action to fetch submitted tasks.
 * @param {PossibleTaskList} props.possibleTasks - The list of possible tasks.
 * @returns {JSX.Element} A JSX element that represents the list of submitted tasks.
 */
export default function ManageSubmittedTaskList({
  getSubmittedTasksAction,
  possibleTasks,
}: {
  getSubmittedTasksAction: (
    page: number
  ) => Promise<Response<{ tasks: SubmittedTaskList; pageAmount: number }>>;
  possibleTasks: PossibleTaskList;
}) {
  // States for loading, the submitted task list, the page and page amount
  const [loading, setLoading] = useState(true);
  const [submittedTasks, setSubmittedTasks] = useState<SubmittedTaskList>([]);
  const [page, setPage] = useState(1);
  const [pageAmount, setPageAmount] = useState(1);

  // Fetch submitted tasks when the page changes
  useEffect(() => {
    const fetchSubmittedTasks = async () => {
      setLoading(true);
      const res = await getSubmittedTasksAction(page);
      if (res.succeed) {
        const tasks = res.data?.tasks ?? [];
        setSubmittedTasks(tasks);
        setPageAmount(res.data?.pageAmount ?? 1);
      } else {
        throw new Error(`Failed to load submitted tasks: ${res.error}`);
      }
      setLoading(false);
    };

    fetchSubmittedTasks();
  }, [page]);

  return (
    <>
      {/* List the tasks */}
      {loading ? (
        <p className="text-gray-500">Laden...</p>
      ) : (
        <div className="flex flex-col gap-4 w-full">
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

          {/* Display a message if there are no tasks */}
          {submittedTasks.length === 0 && (
            <p className="text-gray-500">Er zijn geen opdrachten.</p>
          )}

          {/* Pagination footer */}
          <PagedListFooterComponent
            page={page}
            pageAmount={pageAmount}
            updatePageAction={setPage}
          />
        </div>
      )}
    </>
  );
}
