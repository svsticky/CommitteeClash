'use server';

import { authOptions } from '@/lib/auth/authOptions';
import { HandleUnauthorizedAccess, ThrowResponseError } from '@/lib/utils';
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
      await ThrowResponseError(response);
    }

    // Parse the JSON response
    const result = await response.json();

    console.log('Task submitted successfully:', result);

    return { succeed: true, data: result };
  } catch (error) {
    console.error('Error submitting task:', error);

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
 * Retrieves the list of submitted tasks for a given committee and page number.
 *
 * @param {number} page - The page number to retrieve.
 * @param {string | null} committee - The name of the committee to get submitted tasks for.
 * @returns {Promise<Response<{ submittedTasks: SubmittedTaskList; pageAmount: number }>>} - A promise that resolves to a response object containing the list of submitted tasks and the amount of pages or an error message.
 */
export const GetSubmittedTasks = async (
  page: number,
  committee: string | null = null
): Promise<
  Response<{ submittedTasks: SubmittedTaskList; pageAmount: number }>
> => {
  try {
    console.log('Getting submitted tasks...');

    // Get the session to retrieve the access token
    const session = await getServerSession(authOptions);

    // Make a GET request to the backend to fetch submitted tasks for the specified committee
    const response = await fetch(
      `http://backend:8080/SubmittedTask/GetSubmittedTasks?page=${encodeURIComponent(page)}${committee ? `&committee=${encodeURIComponent(committee)}` : ''}`,
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

    console.log('Loaded submitted tasks successfully:', result);

    return {
      succeed: true,
      data: result as { submittedTasks: SubmittedTaskList; pageAmount: number },
    };
  } catch (error) {
    console.error('Error loading submitted tasks:', error);

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
 * Retrieves the list of pending tasks for a given page and committee.
 *
 * @param {number} page - The page number to retrieve.
 * @param {string | null} committee - The name of the committee to get pending tasks for.
 * @returns {Promise<Response<{ tasks: SubmittedTaskList; pageAmount: number }>>} - A promise that resolves to a response object containing the list of pending tasks and the amount of pages or an error message.
 */
export const GetPendingTasks = async (
  page: number,
  committee: string | null = null
): Promise<Response<{ tasks: SubmittedTaskList; pageAmount: number }>> => {
  try {
    console.log('Getting pending tasks...');

    // Get the session to retrieve the access token
    const session = await getServerSession(authOptions);

    // Make a GET request to the backend to fetch pending tasks for the specified committee
    const response = await fetch(
      `http://backend:8080/SubmittedTask/GetPendingTasks?page=${encodeURIComponent(page)}${committee ? `&committee=${encodeURIComponent(committee)}` : ''}`,
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
    const result = (await response.json()) as {
      pendingTasks: SubmittedTaskList;
      pageAmount: number;
    };

    console.log('Loaded pending tasks successfully:', result);

    return {
      succeed: true,
      data: { tasks: result.pendingTasks, pageAmount: result.pageAmount },
    };
  } catch (error) {
    console.error('Error loading pending tasks:', error);

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
 * Retrieves the list of approved tasks for a given page and committee.
 *
 * @param {number} page - The page number to retrieve.
 * @param {string | null} committee - The name of the committee to get approved tasks for.
 * @returns {Promise<Response<{ tasks: SubmittedTaskList; pageAmount: number }>>} - A promise that resolves to a response object containing the list of approved tasks and the amount of pages or an error message.
 */
export const GetApprovedTasks = async (
  page: number,
  committee: string | null = null
): Promise<Response<{ tasks: SubmittedTaskList; pageAmount: number }>> => {
  try {
    console.log('Getting approved tasks...');

    // Get the session to retrieve the access token
    const session = await getServerSession(authOptions);

    // Make a GET request to the backend to fetch approved tasks for the specified committee
    const response = await fetch(
      `http://backend:8080/SubmittedTask/GetApprovedTasks?page=${encodeURIComponent(page)}${committee ? `&committee=${encodeURIComponent(committee)}` : ''}`,
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
    const result = (await response.json()) as {
      approvedTasks: SubmittedTaskList;
      pageAmount: number;
    };

    console.log('Loaded approved tasks successfully:', result);

    return {
      succeed: true,
      data: { tasks: result.approvedTasks, pageAmount: result.pageAmount },
    };
  } catch (error) {
    console.error('Error loading approved tasks:', error);

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
 * Retrieves the list of rejected tasks for a given page and committee.
 *
 * @param {number} page - The page number to retrieve.
 * @param {string | null} committee - The name of the committee to get rejected tasks for.
 * @returns {Promise<Response<{ tasks: SubmittedTaskList; pageAmount: number }>>} - A promise that resolves to a response object containing the list of rejected tasks and the amount of pages or an error message.
 */
export const GetRejectedTasks = async (
  page: number,
  committee: string | null = null
): Promise<Response<{ tasks: SubmittedTaskList; pageAmount: number }>> => {
  try {
    console.log('Getting rejected tasks...');

    // Get the session to retrieve the access token
    const session = await getServerSession(authOptions);

    // Make a GET request to the backend to fetch rejected tasks for the specified committee
    const response = await fetch(
      `http://backend:8080/SubmittedTask/GetRejectedTasks?page=${encodeURIComponent(page)}${committee ? `&committee=${encodeURIComponent(committee)}` : ''}`,
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
    const result = (await response.json()) as {
      rejectedTasks: SubmittedTaskList;
      pageAmount: number;
    };

    console.log('Loaded rejected tasks successfully:', result);

    return {
      succeed: true,
      data: { tasks: result.rejectedTasks, pageAmount: result.pageAmount },
    };
  } catch (error) {
    console.error('Error loading rejected tasks:', error);

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
