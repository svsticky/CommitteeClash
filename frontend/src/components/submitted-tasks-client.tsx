'use client';

import { GetSubmittedTasks } from '@/actions/submit-task';
import TaskStatusList from '@/components/task-status-list/task-status-list';
import { CommitteeList } from '@/types/Committee';
import { PossibleTaskList } from '@/types/PossibleTask';
import { SubmittedTaskList } from '@/types/SubmittedTask';
import { useEffect, useState } from 'react';
import DropDown from './ui/drop-down';

/**
 * SubmittedTasksClient component that fetches and displays submitted tasks
 * for a selected committee, allowing users to view the status of their tasks.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {PossibleTaskList} props.possibleTasks - The list of possible tasks.
 * @param {CommitteeList} props.committees - The list of committees to choose from.
 * @returns {JSX.Element} A JSX element that represents the submitted tasks client.
 */
export default function SubmittedTasksClient({
  possibleTasks = [],
  committees = [],
}: {
  possibleTasks?: PossibleTaskList;
  committees?: CommitteeList;
}) {
  // Get the names of the committees to populate the dropdown
  const committeeNames = committees.map((c) => c.name);

  // State to manage the selected committee, defaulting to the first committee name
  const [committee, setCommittee] = useState<string>(committeeNames[0]);

  // State to manage the list of submitted tasks
  const [submittedTasks, setSubmittedTasks] = useState<SubmittedTaskList>();

  // State to manage the loading state while fetching tasks
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Function to fetch submitted tasks for the selected committee
    const fetchSubmittedTasks = async () => {
      // Set the loading state to true before fetching
      setIsLoading(true);

      // Call the action to get submitted tasks for the selected committee
      const res = await GetSubmittedTasks(committee);

      // Check if the response was successful and update the state accordingly
      if (res.succeed) {
        setSubmittedTasks(res.data ?? []);
      } else {
        throw new Error(`Failed to load submitted tasks: ${res.error}`);
      }

      // Set the loading state to false after fetching
      setIsLoading(false);
    };

    // Fetch the submitted tasks whenever the committee changes
    fetchSubmittedTasks();
  }, [committee]);

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4">Ingediende opdrachten</h1>
      <div className="flex flex-col gap-4 w-full items-center">
        {/* Dropdown to select the committee for which to view submitted tasks */}
        <DropDown
          title="Commissie"
          options={committeeNames}
          selected={committee ?? ''}
          setSelected={setCommittee}
        />

        {/* Display the list of submitted tasks or a loading message */}
        {isLoading || !possibleTasks ? (
          <p>Loading tasks...</p>
        ) : (
          <TaskStatusList
            submittedTasks={submittedTasks}
            possibleTasks={possibleTasks}
          />
        )}
      </div>
    </div>
  );
}
