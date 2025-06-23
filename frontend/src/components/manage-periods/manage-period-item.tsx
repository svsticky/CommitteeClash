'use client';

import { DeletePeriod, UpdatePeriod } from '@/actions/period';
import { cn } from '@/lib/utils';
import { Period } from '@/types/Period';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '../ui/button';
import { ConfirmDialog } from '../ui/dialog/confirm-dialog';
import { Input } from '../ui/input';

/**
 * ManagePeriodItem component that allows users to manage a period.
 * It provides input fields for the period name, start date, and end date,
 * along with buttons to save changes or delete the period.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Period} props.period - The period object containing its details.
 * @param {string} [props.className] - Optional additional class names for styling.
 * @returns {JSX.Element} A JSX element that represents a form for managing a period.
 */
export default function ManagePeriodItem({
  period,
  className = '',
}: {
  period: Period;
  className?: string;
}) {
  // State to manage the saving and deleting actions
  const [enteredName, setEnteredName] = useState(period.name);
  const [startDate, setStartDate] = useState(period.startDate.split('T')[0]);
  const [endDate, setEndDate] = useState(period.endDate.split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle form submission to update the period
  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent the default form submission behavior
    e.preventDefault();

    // Set saving state to true to indicate that an update operation is in progress
    setIsSaving(true);

    try {
      // Update the period using the UpdatePeriod action
      const res = await UpdatePeriod(
        period.id,
        enteredName.trim(),
        startDate,
        endDate
      );

      // If the update action is successful, show a success message
      // If it fails, show an error message
      if (!res.succeed) {
        toast.error(
          `Er is een fout opgetreden bij het aanpassen van de periode: ${res.error}`
        );

        console.error('Error creating period:', res.error);
      }
      toast.success('Periode succesvol aangepast!');
    } catch (error) {
      toast.error(
        'Er is een fout opgetreden bij het aanpassen van de periode. Probeer het opnieuw.'
      );

      console.error('Error creating period:', error);
    }
    setIsSaving(false);
  };

  // Handle deletion of the period
  const handleDelete = async () => {
    // Set deleting state to true to indicate that a delete operation is in progress
    setIsDeleting(true);

    try {
      // Call the DeletePeriod action to delete the period
      const res = await DeletePeriod(period.id);

      // If it fails, show an error message
      if (!res.succeed) {
        toast.error(
          `Er is een fout opgetreden bij het verwijderen van de periode: ${res.error}`
        );

        console.error('Error deleting period:', res.error);
      }

      // If the delete action is successful, show a success message
      toast.success('Periode succesvol verwijderd!');
    } catch (error) {
      toast.error(
        'Er is een fout opgetreden bij het verwijderen van de periode. Probeer het opnieuw.'
      );

      console.error('Error deleting period:', error);
    }

    // Reset the deleting state after the operation is complete
    setIsDeleting(false);
  };

  return (
    <form
      className={cn('flex gap-2 flex-col md:flex-row', className)}
      onSubmit={(e) => handleSubmit(e)}
    >
      {/* Input field for the period name */}
      <div className="w-full">
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Periode naam
        </label>
        <Input
          value={enteredName}
          placeholder="Naam van de periode, bijv: 2025/2026 of Q1 2025/2026"
          onChange={(e) => setEnteredName(e.target.value)}
        />
      </div>

      {/* Input field for start date */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Startdatum
        </label>
        <Input
          className={`w-full md:w-[140px] ${isSaving ? 'pointer-events-none' : ''}`}
          type="date"
          max={endDate}
          value={startDate}
          placeholder="Startdatum"
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      {/* Input field for end date */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Einddatum
        </label>
        <Input
          className={`w-full md:w-[140px] ${isSaving ? 'pointer-events-none' : ''}`}
          type="date"
          min={startDate}
          value={endDate}
          placeholder="Einddatum"
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <div className="flex flex-col md:flex-row w-full md:w-auto justify-end gap-2 mt-auto">
        {/* Action button for saving the period */}
        <Button
          type="submit"
          disabled={!enteredName.trim() || !startDate || !endDate || isSaving}
        >
          {isSaving ? 'Opslaan...' : 'Opslaan'}
        </Button>

        {/* Delete button wrappend in a confirm dialog */}
        <ConfirmDialog
          title="Periode verwijderen?"
          description="Weet je zeker dat je deze periode wilt verwijderen? Dit kan niet ongedaan worden gemaakt."
          confirmText="Verwijder"
          cancelText="Annuleer"
          onConfirmAction={handleDelete}
          disabled={isDeleting}
        >
          <Button
            type="button"
            className="bg-red-500 hover:bg-red-600 w-full"
            disabled={isSaving}
          >
            Verwijder
          </Button>
        </ConfirmDialog>
      </div>
    </form>
  );
}
