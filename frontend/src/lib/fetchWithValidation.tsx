import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { z } from 'zod';
import { authOptions } from './auth/authOptions';

/**
 * Fetches data from a specified URL and validates it against a provided Zod schema.
 *
 * @template T - The type of the data to be validated.
 * @param {z.ZodSchema<T>} schema - The Zod schema to validate the fetched data against.
 * @param {string} url - The URL to fetch data from.
 * @returns {Promise<z.SafeParseReturnType<T, T>>} - A promise that resolves to a SafeParseReturnType containing the validated data or an error.
 *
 * @remarks
 * If the fetch request fails (response.ok is false), the function will return an error object
 * with the message from the backend response. The backend should ensure that error messages
 * don't contain sensitive information.
 */
export async function FetchWithValidation<T>(
  schema: z.ZodSchema<T>,
  url: string
): Promise<z.SafeParseReturnType<T, T>> {
  try {
    const session = await getServerSession(authOptions);

    // Fetch the data from the backend
    const cookieHeader = await cookies();
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader.toString() || '',
        Authorization: `Bearer ${session?.accessToken || ''}`,
      },
    });

    // Check if the response is OK, if not, return an error got from the backend. (make sure the backend returns an error object and does not contain any sensitive information)
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized access. Please log in again.');
      }
      const fetchErrorResponse = {
        success: false,
        error: new Error(await response.text()),
      } as z.SafeParseReturnType<T, T>;
      return fetchErrorResponse;
    }

    // Parse the response as JSON
    const data = await response.json();

    // Validate the data with the schema
    const result = schema.safeParse(data);
    return result;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Unauthorized access. Please log in again.'
    ) {
      // Redirect to the login page if unauthorized
      redirect('/login');
    }
    // Return an error object if an exception occurs
    const fetchErrorResponse = {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
    } as z.SafeParseReturnType<T, T>;
    return fetchErrorResponse;
  }
}
