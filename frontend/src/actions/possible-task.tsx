'use server';

import { authOptions } from '@/lib/auth/authOptions';
import { HandleUnauthorizedAccess, ThrowResponseError } from '@/lib/utils';
import { PossibleTaskList } from '@/types/PossibleTask';
import { Response } from '@/types/Response';
import { getServerSession } from 'next-auth';

/**
 * Fetches the list of possible tasks from the backend.
 *
 * @returns {Promise<Response<PossibleTaskList>>} - A promise that resolves to a response object containing the list of possible tasks or an error message.
 */
export const GetPossibleTasks = async (): Promise<
  Response<PossibleTaskList>
> => {
  try {
    console.log('Getting possible tasks...');

    // Get the session to retrieve the access token
    const session = await getServerSession(authOptions);

    // Make a GET request to the backend to fetch possible tasks
    const response = await fetch(
      'http://backend:8080/PossibleTask/GetPossibleTasks',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session?.accessToken || ''}`,
        },
      }
    );

    // Check if the response is ok (status code 200-299)
    if (!response.ok) {
      await ThrowResponseError(response);
    }

    // Parse the JSON response
    const result = await response.json();

    console.log('Possible tasks loaded succesfully:', result);

    return { succeed: true, data: result };
  } catch (error) {
    console.error('Error getting possible tasks:', error);

    // Handle unauthorized access
    if (error instanceof Error) {
      HandleUnauthorizedAccess(error);
    }

    return {
      succeed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Creates a new possible task with the specified parameters.
 *
 * @param {string} description - The description of the possible task.
 * @param {string} shortDescription - A short description of the possible task.
 * @param {number} points - The points associated with the possible task.
 * @param {boolean} isActive - Whether the possible task is active (default is true).
 * @param {number | null} maxPerPeriod - The maximum number of times this task can be completed per period, or null if unlimited.
 * @returns {Promise<Response<void>>} - A promise that resolves to a response object indicating success or failure.
 */
export const CreatePossibleTask = async (
  description: string,
  shortDescription: string,
  points: number,
  isActive: boolean = true,
  maxPerPeriod: number | null
): Promise<Response<void>> => {
  try {
    console.log('Creating possible task...');

    // Get the session to retrieve the access token
    const session = await getServerSession(authOptions);

    // Make a POST request to the backend to create a new possible task
    const response = await fetch(
      `http://backend:8080/PossibleTask/CreatePossibleTask?description=${encodeURIComponent(description)}&shortDescription=${encodeURIComponent(shortDescription)}&points=${encodeURIComponent(points)}&isActive=${isActive}${maxPerPeriod === null ? '' : `&maxPerPeriod=${encodeURIComponent(maxPerPeriod)}`}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.accessToken || ''}`,
        },
      }
    );

    // Check if the response is ok (status code 200-299)
    if (!response.ok) {
      await ThrowResponseError(response);
    }

    // Parse the JSON response
    const result = await response.json();

    console.log('Possible task created succesfully:', result);

    return { succeed: true };
  } catch (error) {
    console.error('Error creating possible task:', error);

    // Handle unauthorized access
    if (error instanceof Error) {
      HandleUnauthorizedAccess(error);
    }

    return {
      succeed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Edits an existing possible task with the specified parameters.
 *
 * @param {string} taskId - The ID of the possible task to edit.
 * @param {string} description - The new description of the possible task.
 * @param {string} shortDescription - A new short description of the possible task.
 * @param {number} points - The new points associated with the possible task.
 * @param {boolean} isActive - Whether the possible task is active (default is true).
 * @param {number | null} maxPerPeriod - The new maximum number of times this task can be completed per period, or null if unlimited.
 * @returns {Promise<Response<void>>} - A promise that resolves to a response object indicating success or failure.
 */
export const EditPossibleTaskAction = async (
  taskId: string,
  description: string,
  shortDescription: string,
  points: number,
  isActive: boolean = true,
  maxPerPeriod: number | null
): Promise<Response<void>> => {
  try {
    console.log('Editing possible task...');

    // Get the session to retrieve the access token
    const session = await getServerSession(authOptions);

    // Make a PUT request to the backend to edit the possible task
    const response = await fetch(
      `http://backend:8080/PossibleTask/EditPossibleTask?taskId=${encodeURIComponent(taskId)}&description=${encodeURIComponent(description)}&shortDescription=${encodeURIComponent(shortDescription)}&points=${encodeURIComponent(points)}&isActive=${isActive}${maxPerPeriod === null ? '' : `&maxPerPeriod=${encodeURIComponent(maxPerPeriod)}`}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${session?.accessToken || ''}`,
        },
      }
    );

    // Check if the response is ok (status code 200-299)
    if (!response.ok) {
      await ThrowResponseError(response);
    }

    // Parse the JSON response
    const result = await response.json();

    console.log('Possible task edited succesfully:', result);

    return { succeed: true };
  } catch (error) {
    console.error('Error editing possible task:', error);

    // Handle unauthorized access
    if (error instanceof Error) {
      HandleUnauthorizedAccess(error);
    }

    return {
      succeed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
