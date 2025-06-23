'use server';

import { authOptions } from '@/lib/auth/authOptions';
import { Response } from '@/types/Response';
import { SubmittedTaskList } from '@/types/SubmittedTask';
import { getServerSession } from 'next-auth';

/**
 * Submits a task with the given ID, committee, and photo.
 *
 * @param {string} taskId - The ID of the task to submit.
 * @param {string} committee - The committee associated with the task.
 * @param {File} photo - The photo file to submit with the task.
 * @returns {Promise<Response<void>>} - A promise that resolves to a response object indicating success or failure.
 */
export const SubmitTaskAction = async (
  taskId: string,
  committee: string,
  photo: File
): Promise<Response<void>> => {
  try {
    console.log('Submitting task...');

    // Create a FormData object to hold the task submission data
    const formData = new FormData();
    formData.append('TaskId', taskId);
    formData.append('Committee', committee);
    formData.append('Image', photo);

    // Get the session to retrieve the access token
    const session = await getServerSession(authOptions);

    // Make a POST request to the backend to submit the task
    const response = await fetch(
      'http://backend:8080/SubmittedTask/SubmitTask',
      {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${session?.accessToken || ''}`,
        },
      }
    );

    // Check if the response is ok (status code 200-299)
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    // Parse the JSON response
    const result = await response.json();

    console.log('Task submitted successfully:', result);

    return { succeed: true, data: result };
  } catch (error) {
    console.error('Error submitting task:', error);

    return {
      succeed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Retrieves the list of submitted tasks for a given committee.
 *
 * @param {string} committee - The name of the committee to get submitted tasks for.
 * @returns {Promise<Response<SubmittedTaskList>>} - A promise that resolves to a response object containing the list of submitted tasks or an error message.
 */
export const GetSubmittedTasks = async (
  committee: string
): Promise<Response<SubmittedTaskList>> => {
  try {
    console.log('Getting submitted tasks...');

    // Get the session to retrieve the access token
    const session = await getServerSession(authOptions);

    // Make a GET request to the backend to fetch submitted tasks for the specified committee
    const response = await fetch(
      `http://backend:8080/SubmittedTask/GetSubmittedTasks?committee=${encodeURIComponent(committee)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session?.accessToken || ''}`,
        },
      }
    );

    // Check if the response is ok (status code 200-299)
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    // Parse the JSON response
    const result = await response.json();

    console.log('Loaded submitted tasks successfully:', result);

    return { succeed: true, data: result as SubmittedTaskList };
  } catch (error) {
    console.error('Error loading submitted tasks:', error);

    return {
      succeed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
