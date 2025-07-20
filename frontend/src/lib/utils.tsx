import { clsx, type ClassValue } from 'clsx';
import { redirect } from 'next/navigation';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names into a single string, merging Tailwind CSS classes.
 *
 * @param {...ClassValue[]} inputs - The class names to combine.
 * @returns {string} - A single string containing all class names, with duplicates merged.
 *
 * @example
 * cn('bg-red-500', 'text-white', 'bg-red-500'); // returns 'bg-red-500 text-white'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Throws an error if the response is not ok (status code 200-299).
 *
 * @param {globalThis.Response} response - The response object to check.
 * @throws {Error} - Throws an error with the response text if the response is not ok.
 */
export async function ThrowResponseError(response: globalThis.Response) {
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized access. Please log in again.');
    }
    throw new Error(`Error: ${await response.text()}`);
  }
}

/**
 * Handles unauthorized access by redirecting to the logout page.
 *
 * @param {Error} error - The error object containing the error message.
 */
export function HandleUnauthorizedAccess(error: Error) {
  if (error.message === 'Unauthorized access. Please log in again.') {
    // Redirect to the logout page if unauthorized
    redirect('/logout');
  }
}
