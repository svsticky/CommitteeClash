'use client';

import {
  CreatePossibleTask,
  EditPossibleTaskAction,
} from '@/actions/possible-task';
import { PossibleTask } from '@/types/PossibleTask';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

/**
 * EditPossibleTask component that allows users to create or edit a possible task.
 * It provides input fields for the task's short description, long description, points,
 * maximum occurrences per period, and whether the task is active.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {PossibleTask|null} [props.possibleTask] - The possible task object to edit, or null for creating a new task.
 * @param {string} [props.className] - Optional additional class names for styling.
 * @returns {JSX.Element} A JSX element that represents a form for creating or editing a possible task.
 */
export default function EditPossibleTask({
  possibleTask = null,
  className = '',
}: {
  possibleTask?: PossibleTask | null;
  className?: string;
}) {
  // Determine if the component is in edit mode based on the presence of a possibleTask
  const isEditMode = possibleTask !== null;

  // State variables for the form fields with the possibleTask values set if it is in edit mode
  const [shortDescription, setShortDescription] = useState<string>(
    isEditMode ? possibleTask.shortDescription : ''
  );
  const [description, setDescription] = useState<string>(
    isEditMode ? possibleTask.description : ''
  );
  const [points, setPoints] = useState<string>(
    isEditMode ? possibleTask.points.toString() : ''
  );
  const [maxPerPeriodActive, setMaxPerPeriodActive] = useState<boolean>(
    possibleTask &&
      possibleTask.maxPerPeriod &&
      possibleTask.maxPerPeriod !== null
      ? true
      : false
  );
  const [maxPerPeriod, setMaxPerPeriod] = useState<string>(
    isEditMode &&
      possibleTask.maxPerPeriod !== null &&
      possibleTask.maxPerPeriod
      ? possibleTask.maxPerPeriod.toString()
      : ''
  );
  const [isActive, setIsActive] = useState<boolean>(
    isEditMode ? possibleTask.isActive : true
  );

  // State to manage the loading state of the form submission
  const [isLoading, setIsLoading] = useState(false);

  // Next.js router for navigation after form submission
  const router = useRouter();

  // Function to handle the form submission for creating a new possible task
  const handleCreatePossibleTask = async (e: React.FormEvent) => {
    // Prevent the default form submission behavior
    e.preventDefault();

    // Set loading state to true to indicate that a create operation is in progress
    setIsLoading(true);

    try {
      // Trim the input values and parse points and maxPerPeriod if applicable
      const trimmedShortDescription = shortDescription.trim();
      const trimmedDescription = description.trim();
      const trimmedPoints = parseInt(points.trim());

      // Create a new possible task using the CreatePossibleTask action
      const res = await CreatePossibleTask(
        trimmedDescription,
        trimmedShortDescription,
        trimmedPoints,
        isActive,
        maxPerPeriodActive ? parseInt(maxPerPeriod) : null
      );

      // If the create action is successful, show a success message and navigate to the ManageTasks page
      if (res.succeed) {
        toast.success('Opdracht succesvol aangemaakt!');

        router.push('/Admin/ManageTasks');
        return;
      }

      // If the create action is not successful, show an error message
      toast.error(
        `Er is een fout opgetreden bij het aanmaken van de opdracht: ${res.error}`
      );

      console.error('Error creating possible task:', res.error);
    } catch (error) {
      toast.error(
        'Er is een fout opgetreden bij het aanmaken van de opdracht. Probeer het opnieuw.'
      );

      console.error('Error editing possible task:', error);
    }

    // Reset the loading state after the operation is complete
    setIsLoading(false);
  };

  // Function to handle the form submission for editing an existing possible task
  const handleEditPossibleTask = async (e: React.FormEvent) => {
    // Prevent the default form submission behavior
    e.preventDefault();

    // Set loading state to true to indicate that an edit operation is in progress
    setIsLoading(true);

    try {
      // Trim the input values and parse points and maxPerPeriod if applicable
      const trimmedShortDescription = shortDescription.trim();
      const trimmedDescription = description.trim();
      const trimmedPoints = parseInt(points.trim());

      // Edit the existing possible task using the EditPossibleTaskAction
      const res = await EditPossibleTaskAction(
        possibleTask?.id ?? '',
        trimmedDescription,
        trimmedShortDescription,
        trimmedPoints,
        isActive,
        maxPerPeriodActive ? parseInt(maxPerPeriod) : null
      );

      // If the edit action is successful, show a success message and navigate to the ManageTasks page
      if (res.succeed) {
        toast.success('Opdracht succesvol aangepast!');

        router.push('/Admin/ManageTasks');
        return;
      }

      // If the edit action is not successful, show an error message
      toast.error(
        `Er is een fout opgetreden bij het aanpassen van de opdracht: ${res.error}`
      );

      console.error('Error creating possible task:', res.error);
    } catch (error) {
      toast.error(
        'Er is een fout opgetreden bij het aanpassen van de opdracht. Probeer het opnieuw.'
      );

      console.error('Error editing possible task:', error);
    }

    // Reset the loading state after the operation is complete
    setIsLoading(false);
  };

  return (
    <form
      className={className}
      onSubmit={isEditMode ? handleEditPossibleTask : handleCreatePossibleTask}
    >
      {/* Input field for a short description of the task */}
      <label className="block mb-2">
        <span className="text-sm font-medium">Korte beschrijving</span>
      </label>
      <Input
        maxLength={50}
        placeholder="Korte beschrijving van de opdracht"
        className={`mb-4 ${isLoading ? 'pointer-events-none' : ''}`}
        defaultValue={shortDescription}
        onChange={(e) => setShortDescription(e.target.value)}
        required
      />

      {/* Textarea for a long description of the task */}
      <label className="block mb-2">
        <span className="text-sm font-medium">Lange beschrijving</span>
      </label>
      <Textarea
        maxLength={500}
        placeholder="Lange beschrijving van de opdracht"
        className={`mb-4 ${isLoading ? 'pointer-events-none' : ''}`}
        defaultValue={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      {/* Input field for the points associated with the task */}
      <label className="block mb-2">
        <span className="text-sm font-medium">Punten</span>
      </label>
      <Input
        type="number"
        step={1}
        min={1}
        max={100}
        placeholder="Aantal punten"
        className={`mb-4 ${isLoading ? 'pointer-events-none' : ''}`}
        defaultValue={points}
        onChange={(e) => setPoints(e.target.value)}
        required
      />

      {/* Checkbox and input field for maximum occurrences per period */}
      <div className="flex gap-2">
        <Input
          type="checkbox"
          className={`h-4 w-4 mt-[2px] ${isLoading && 'pointer-events-none'}`}
          defaultChecked={maxPerPeriodActive}
          onChange={(e) => setMaxPerPeriodActive(e.target.checked)}
        />
        <div className="w-full">
          <label
            className={`block mb-1 text-sm font-medium ${maxPerPeriodActive ? 'text-gray-700' : 'text-gray-400'}`}
          >
            Maximaal aantal keer voor deze opdracht per periode:
          </label>
          <Input
            type="number"
            step="1"
            min="1"
            placeholder="Maximaal aantal keer voor deze opdracht per periode"
            className={`w-full mb-4 ${isLoading && 'pointer-events-none'}`}
            defaultValue={maxPerPeriod}
            onChange={(e) => setMaxPerPeriod(e.target.value)}
            disabled={!maxPerPeriodActive}
          />
        </div>
      </div>

      {/* Checkbox to indicate if the task is active */}
      <div className="mb-4 flex items-center gap-2">
        <label htmlFor="isActive" className="text-sm font-medium">
          Actief
        </label>
        <Input
          id="isActive"
          type="checkbox"
          defaultChecked={isEditMode ? possibleTask.isActive : true}
          className={`h-4 w-4 ${isLoading ? 'pointer-events-none' : ''}`}
          defaultValue={isActive ? 'true' : 'false'}
          onChange={(e) => setIsActive(e.target.checked)}
        />
      </div>

      {/* Submit button to create or edit the possible task */}
      <div className="flex flex-col items-center">
        <Button
          type="submit"
          disabled={
            isLoading ||
            !shortDescription ||
            !description ||
            !points ||
            shortDescription.trim() == '' ||
            description.trim() == '' ||
            points.trim() == '' ||
            (maxPerPeriodActive &&
              (maxPerPeriod.trim() === '' || !maxPerPeriod))
          }
        >
          {isEditMode
            ? isLoading
              ? 'Opslaan...'
              : 'Sla op'
            : isLoading
              ? 'Aanmaken...'
              : 'Maak aan'}
        </Button>
      </div>
    </form>
  );
}
