import { clsx, type ClassValue } from 'clsx';
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
