'use client'; // verplicht voor error.tsx

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

/**
 * Error component that displays an error message and a button to reset the error state.
 * This is a client-side component that handles errors in the application.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Error} props.error - The error object containing error details.
 * @param {Function} props.reset - Function to reset the error state.
 *
 * @returns {JSX.Element} A JSX element that contains the error message and reset button.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  // Log the error to the console for debugging purposes
  // This will help in identifying the error when it occurs
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <h1 className="text-2xl font-semibold">Oeps, er ging iets mis!</h1>
      <Button onClick={() => reset()} className="mt-4">
        Probeer het opnieuw
      </Button>
    </>
  );
}
