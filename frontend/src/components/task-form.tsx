'use client';

import { SubmitTaskAction } from '@/actions/submit-task';
import { CommitteeList } from '@/types/Committee';
import { PossibleTaskList } from '@/types/PossibleTask';
import { Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from './ui/button';
import DropDown from './ui/drop-down';

/**
 * TaskForm component that allows users to submit tasks to a selected committee.
 * It includes dropdowns for selecting a committee and a task, and an upload input for submitting
 * a photo as proof of task completion.
 *
 * @param {Object} props - The properties for the TaskForm component.
 * @param {CommitteeList} [props.committees=[]] - The list of committees to choose from.
 * @param {PossibleTaskList} [props.tasks=[]] - The list of possible tasks to choose from.
 * @param {string} [props.className=''] - Additional CSS classes to apply to the form.
 * @returns {JSX.Element} A JSX element representing the task submission form.
 */
export default function TaskForm({
  committees = [],
  tasks = [],
  className = '',
}: {
  committees?: CommitteeList;
  className?: string;
  tasks?: PossibleTaskList;
}) {
  // State variables to manage the selected committee, task, task ID, and photo upload
  const [selectedCommittee, setSelectedCommittee] = useState<string | null>(
    null
  );
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);

  // Extract committee names for the dropdown options
  const committeeNames = committees.map((committee) => committee.name);

  // Use Next.js router for navigation after form submission
  const router = useRouter();

  // State to manage the loading state while submitting the task
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Update the selected task ID based on the selected task
    if (selectedTask) {
      const task = tasks[parseInt(selectedTask.split('.')[0]) - 1];
      setSelectedTaskId(task ? task.id : null);
    } else {
      setSelectedTaskId(null);
    }
  }, [selectedTask, tasks]);

  // Function to handle a change in the photo input
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Check if files are selected and set the first file as the photo
    if (e.target.files && e.target.files.length > 0) {
      // Set the photo state to the first selected file
      setPhoto(e.target.files[0]);
    } else {
      // If no files are selected, reset the photo state
      setPhoto(null);
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent the default form submission behavior
    e.preventDefault();

    // Set loading state to true while submitting
    setIsLoading(true);

    // Submit the task using the provided action
    const res = await SubmitTaskAction(
      selectedTaskId ?? '',
      selectedCommittee ?? '',
      photo ?? new File([], '')
    );

    // Check if the submission was successful, if so navigate to the home page and show a success message
    // If not, show an error message and log the error
    if (res.succeed) {
      router.push('/');

      toast.success('Opdracht succesvol ingediend!');
    } else {
      toast.error(
        `Er is iets misgegaan met het indienen van de opdracht: ${res.error}`
      );

      console.error('Error submitting task:', res.error);

      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex flex-col items-start">
        {/* Dropdown to select committee */}
        <DropDown
          className={`pb-6 ${isLoading ? 'pointer-events-none' : ''}`}
          title="Commissie"
          options={committeeNames}
          setSelected={setSelectedCommittee}
          selected={selectedCommittee ?? ''}
          required={true}
        />

        {/* Dropdown to select task */}
        <DropDown
          className={`pb-6 ${isLoading ? 'pointer-events-none' : ''}`}
          title="Opdracht"
          options={tasks.map(
            (task, index) => `${index + 1}. ${task.shortDescription}`
          )}
          setSelected={setSelectedTask}
          selected={selectedTask ?? ''}
          required={true}
        />

        {/* Input button for the photo */}
        <label
          className={`min-w-[20%] ${isLoading ? 'pointer-events-none' : ''}`}
        >
          <p className="text-s font-bold">Upload foto als bewijs:</p>
          <label className="flex items-center justify-center cursor-pointer bg-white text-gray-800 border border-gray-300 rounded-sm px-4 py-2 hover:bg-gray-100 h-[36.67px] overflow-hidden whitespace-nowrap truncate">
            {photo ? photo.name : 'Upload photo'}
            <Upload className="ml-2 h-4 w-4 text-gray-500" />
            <input
              name="Photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              required
              className="hidden"
            />
          </label>
        </label>
      </div>

      {/* Submit button to submit the task */}
      <div className="flex flex-col items-center mt-4">
        <Button
          type="submit"
          disabled={!selectedCommittee || !selectedTask || !photo || isLoading}
        >
          {isLoading ? 'Opdracht indienen...' : 'Dien opdracht in'}
        </Button>
      </div>
    </form>
  );
}
