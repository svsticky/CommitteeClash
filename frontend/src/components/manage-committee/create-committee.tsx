'use client';

import { CreateCommitteeAction } from '@/actions/committee';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

/**
 * CreateCommittee component that allows users to create a new committee.
 * It provides an input field for the committee name and a button to submit the form.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} [props.className] - Optional additional class names for styling.
 * @returns {JSX.Element} A JSX element that represents a form for creating a committee.
 */
export default function CreateCommittee({
  className = '',
}: {
  className?: string;
}) {
  // State to manage the loading state and the entered committee name
  const [isLoading, setIsLoading] = useState(false);
  const [enteredName, setEnteredName] = useState('');

  // Handle form submission to create a new committee
  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent the default form submission behavior
    e.preventDefault();

    // Set loading state to true to indicate that a create operation is in progress
    setIsLoading(true);

    try {
      // Create a new committee using the CreateCommitteeAction
      const res = await CreateCommitteeAction(enteredName.trim());

      // If the create action is successful, reset the entered name and show a success message
      // If it fails, show an error message
      if (res.succeed) {
        setEnteredName('');

        toast.success('Commissie succesvol aangemaakt!');
      } else {
        toast.error(
          `Er is een fout opgetreden bij het aanmaken van de commissie: ${res.error}`
        );

        console.error('Error creating committee:', res.error);
      }
    } catch (error) {
      toast.error(
        'Er is een fout opgetreden bij het aanmaken van de commissie. Probeer het opnieuw.'
      );

      console.error('Error creating committee:', error);
    }

    // Reset loading state after the operation is complete
    setIsLoading(false);
  };

  return (
    <form
      className={cn('flex gap-2 flex-col sm:flex-row', className)}
      onSubmit={(e) => handleSubmit(e)}
    >
      {/* Input field for the committee name */}
      <Input
        value={enteredName}
        placeholder="Naam van de commissie"
        onChange={(e) => setEnteredName(e.target.value)}
        className={isLoading ? 'pointer-events-none' : ''}
      />

      {/* Submit button to create the committee */}
      <Button
        type="submit"
        disabled={!enteredName || enteredName.trim() == '' || isLoading}
      >
        {isLoading ? 'Commissie aanmaken...' : 'Maak commissie aan'}
      </Button>
    </form>
  );
}
