'use server';

import { authOptions } from '@/lib/auth/authOptions';
import { CommitteeList } from '@/types/Committee';
import { Response } from '@/types/Response';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';

/**
 * Fetches the list of periods from the backend.
 *
 * @returns {Promise<Response<CommitteeList>>} - A promise that resolves to a response object containing the list of periods or an error message.
 */
export const GetPeriods = async (): Promise<Response<CommitteeList>> => {
  try {
    console.log('Getting periods...');

    // Get the session to retrieve the access token
    const session = await getServerSession(authOptions);

    // Make a GET request to the backend to fetch periods
    const response = await fetch('http://backend:8080/Period/GetPeriods', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session?.accessToken || ''}`,
      },
    });

    // Check if the response is ok (status code 200-299)
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    // Parse the JSON response
    const result = await response.json();

    console.log('Periods loaded succesfully:', result);

    return { succeed: true, data: result };
  } catch (error) {
    console.error('Error getting committees:', error);

    return {
      succeed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Creates a new period with the specified name, start date, and end date.
 *
 * @param {string} name - The name of the period to create.
 * @param {string} startDate - The start date of the period in ISO format.
 * @param {string} endDate - The end date of the period in ISO format.
 * @returns {Promise<Response<void>>} - A promise that resolves to a response object indicating success or failure.
 */
export const CreatePeriodAction = async (
  name: string,
  startDate: string,
  endDate: string
): Promise<Response<void>> => {
  try {
    console.log('Creating period...');

    // Get the session to retrieve the access token
    const session = await getServerSession(authOptions);

    // Make a POST request to the backend to create a new period
    const response = await fetch(
      `http://backend:8080/Period/CreatePeriod?name=${encodeURIComponent(name)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
      {
        method: 'POST',
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

    console.log('Period created succesfully:', result);

    // Revalidate the path to ensure the new period is reflected in the UI
    revalidatePath('/Admin/ManagePeriods');

    return { succeed: true, data: result };
  } catch (error) {
    console.error('Error creating period:', error);

    return {
      succeed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Updates an existing period with the specified ID, name, start date, and end date.
 *
 * @param {string} id - The ID of the period to update.
 * @param {string} name - The new name for the period.
 * @param {string} startDate - The new start date for the period in ISO format.
 * @param {string} endDate - The new end date for the period in ISO format.
 * @returns {Promise<Response<void>>} - A promise that resolves to a response object indicating success or failure.
 */
export const UpdatePeriod = async (
  id: string,
  name: string,
  startDate: string,
  endDate: string
): Promise<Response<void>> => {
  try {
    console.log('Renaming committee...');

    // Get the session to retrieve the access token
    const session = await getServerSession(authOptions);

    // Make a PUT request to the backend to update the period
    const response = await fetch(
      `http://backend:8080/Period/UpdatePeriod?periodId=${id}&name=${encodeURIComponent(name)}&startDate=${startDate}&endDate=${endDate}`,
      {
        method: 'PUT',
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

    console.log('Period updated succesfully:', response);

    // Revalidate the path to ensure the updated period is reflected in the UI
    revalidatePath('/Admin/ManagePeriods');

    return { succeed: true };
  } catch (error) {
    console.error('Error updating committee:', error);

    return {
      succeed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Deletes a period with the specified ID.
 *
 * @param {string} id - The ID of the period to delete.
 * @returns {Promise<Response<void>>} - A promise that resolves to a response object indicating success or failure.
 */
export const DeletePeriod = async (id: string): Promise<Response<void>> => {
  try {
    console.log('Deleting period...');

    // Get the session to retrieve the access token
    const session = await getServerSession(authOptions);

    // Make a DELETE request to the backend to delete the period
    const response = await fetch(
      `http://backend:8080/Period/DeletePeriod?periodId=${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
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

    console.log('Period deleted succesfully:', response);

    // Revalidate the path to ensure the deleted period is no longer reflected in the UI
    revalidatePath('/Admin/ManagePeriods');

    return { succeed: true };
  } catch (error) {
    console.error('Error deleting period:', error);

    return {
      succeed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
