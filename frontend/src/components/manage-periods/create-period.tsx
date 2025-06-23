'use client';

import { CreatePeriodAction } from '@/actions/period';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

/**
 * CreatePeriod component that allows users to create a new period.
 * It provides input fields for the period name, start date, and end date,
 * along with a button to submit the form.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} [props.className] - Optional additional class names for styling.
 * @returns {JSX.Element} A JSX element that represents a form for creating a period.
 */
export default function CreatePeriod({
  className = '',
}: {
  className?: string;
}) {
  // State to manage the loading state and the entered period details
  const [isLoading, setIsLoading] = useState(false);
  const [enteredName, setEnteredName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Handle form submission to create a new period
  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent the default form submission behavior
    e.preventDefault();

    // Set loading state to true to indicate that a create operation is in progress
    setIsLoading(true);

    try {
      // Create a new period using the CreatePeriodAction
      const res = await CreatePeriodAction(
        enteredName.trim(),
        startDate,
        endDate
      );

      // If the create action is successful, reset the entered fields and show a success message
      // If it fails, show an error message
      if (res.succeed) {
        setEnteredName('');
        setStartDate('');
        setEndDate('');

        toast.success('Periode succesvol aangemaakt!');
      } else {
        toast.error(
          `Er is een fout opgetreden bij het aanmaken van de periode: ${res.error}`
        );

        console.error('Error creating period:', res.error);
      }
    } catch (error) {
      toast.error(
        'Er is een fout opgetreden bij het aanmaken van de periode. Probeer het opnieuw.'
      );

      console.error('Error creating period:', error);
    }

    // Reset loading state after the operation is complete
    setIsLoading(false);
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
          className={isLoading ? 'pointer-events-none' : ''}
        />
      </div>

      {/* Input field for start date */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Startdatum
        </label>
        <Input
          type="date"
          max={endDate}
          value={startDate}
          placeholder="Startdatum"
          onChange={(e) => setStartDate(e.target.value)}
          className={`w-full md:w-[140px] ${isLoading ? 'pointer-events-none' : ''}`}
        />
      </div>

      {/* Input field for end date */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Einddatum
        </label>
        <Input
          type="date"
          min={startDate}
          value={endDate}
          placeholder="Einddatum"
          onChange={(e) => setEndDate(e.target.value)}
          className={`w-full md:w-[140px] ${isLoading ? 'pointer-events-none' : ''}`}
        />
      </div>

      {/* Submit button to create the period */}
      <Button
        type="submit"
        disabled={
          !enteredName ||
          enteredName.trim() == '' ||
          endDate == '' ||
          startDate == '' ||
          isLoading
        }
        className="mt-auto"
      >
        {isLoading ? 'Periode aanmaken...' : 'Maak periode aan'}
      </Button>
    </form>
  );
}
