'use client';

import { DeleteCommittee, RenameCommitteeAction } from '@/actions/committee';
import { cn } from '@/lib/utils';
import { Committee } from '@/types/Committee';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '../ui/button';
import { ConfirmDialog } from '../ui/dialog/confirm-dialog';
import { Input } from '../ui/input';

/**
 * CommitteeItem component that allows users to rename or delete a committee.
 * It provides an input field for the committee name and buttons for saving changes or deleting the committee.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Committee} props.committee - The committee object containing its name and other details.
 * @param {string} [props.className] - Optional additional class names for styling.
 * @returns {JSX.Element} A JSX element that represents a form for managing a committee.
 */
export default function CommitteeItem({
  committee,
  className = '',
}: {
  committee: Committee;
  className?: string;
}) {
  // State to manage the saving and deleting actions
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // State to manage the entered committee name
  const [enteredName, setEnteredName] = useState(committee.name || '');

  // Handle form submission to rename the committee
  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent the default form submission behavior
    e.preventDefault();

    // Do nothing if the entered name is unchanged
    if (enteredName == committee.name) {
      return;
    }

    // Set saving state to true to indicate that a save operation is in progress
    setIsSaving(true);

    try {
      // Trim the entered name and call the rename action
      const trimmedName = enteredName.trim();

      // Rename the committee using the RenameCommitteeAction
      const res = await RenameCommitteeAction(committee.name, trimmedName);

      // If the rename action is successful, update the committee name and show a success message
      // If it fails, show an error message
      if (res.succeed) {
        committee.name = trimmedName;
        toast.success('Commissie succesvol aangepast!');
      } else {
        toast.error(
          `Er is een fout opgetreden bij het aanpassen van de commissie: ${res.error}`
        );

        console.error('Error renaming committee:', res.error);
      }
    } catch (error) {
      toast.error(
        'Er is een fout opgetreden bij het aanpassen van de commissie. Probeer het opnieuw.'
      );

      console.error('Error renaming committee:', error);
    }

    // Reset the saving state
    setIsSaving(false);
  };

  // Handle the delete action for the committee
  const handleDelete = async () => {
    // Set deleting state to true to indicate that a delete operation is in progress
    setIsDeleting(true);

    try {
      // Call the DeleteCommittee action to delete the committee
      const res = await DeleteCommittee(committee.name);

      // If the delete action is successful, show a success message
      // If it fails, show an error message
      if (!res.succeed) {
        toast.error(
          `Er is een fout opgetreden bij het verwijderen van de commissie: ${res.error}`
        );

        console.error('Error deleting committee:', res.error);
      }

      toast.success('Commissie succesvol verwijderd!');
    } catch (error) {
      toast.error(
        'Er is een fout opgetreden bij het verwijderen van de commissie. Probeer het opnieuw.'
      );

      console.error('Error deleting committee:', error);
    }

    // Reset the deleting state
    setIsDeleting(false);
  };

  return (
    <form
      className={cn(
        'flex gap-2 flex-col sm:items-center sm:flex-row',
        className
      )}
      onSubmit={(e) => handleSubmit(e)}
    >
      {/* Input field for entering the committee name */}
      <Input
        value={enteredName}
        placeholder="Naam van de commissie"
        onChange={(e) => setEnteredName(e.target.value)}
      />

      {/* Button to save the changes */}
      <Button
        type="submit"
        disabled={!enteredName || enteredName.trim() == '' || isSaving}
      >
        {isSaving ? 'Opslaan...' : 'Opslaan'}
      </Button>

      {/* Button to delete the committee, wrapped in a confirmation dialog */}
      <ConfirmDialog
        title="Commissie verwijderen?"
        description="Weet je zeker dat je deze commissie wilt verwijderen? Dit kan niet ongedaan worden gemaakt."
        confirmText="Verwijder"
        cancelText="Annuleer"
        onConfirmAction={handleDelete}
        disabled={isDeleting}
      >
        <Button
          type="button"
          className="bg-red-500 hover:bg-red-600 w-full sm:w-auto"
          disabled={isSaving}
        >
          Verwijder
        </Button>
      </ConfirmDialog>
    </form>
  );
}
