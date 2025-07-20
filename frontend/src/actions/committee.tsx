'use server';

import { authOptions } from '@/lib/auth/authOptions';
import { HandleUnauthorizedAccess, ThrowResponseError } from '@/lib/utils';
import { CommitteeList } from '@/types/Committee';
import { Response } from '@/types/Response';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';

/**
 * Fetches the list of committees from the backend.
 *
 * @returns {Promise<Response<CommitteeList>>} - A promise that resolves to a response object containing the list of committees or an error message.
 */
export const GetCommittees = async (): Promise<Response<CommitteeList>> => {
  try {
    console.log('Getting committees...');

    // Get the session to retrieve the access token
    const session = await getServerSession(authOptions);

    // Make a GET request to the backend to fetch committees
    const response = await fetch(
      'http://backend:8080/Committee/GetCommittees',
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

    console.log('Committees loaded succesfully:', result);

    return { succeed: true, data: result };
  } catch (error) {
    console.error('Error getting committees:', error);

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
 * Creates a new committee with the specified name.
 *
 * @param {string} name - The name of the committee to create.
 * @returns {Promise<Response<void>>} - A promise that resolves to a response object indicating success or failure.
 */
export const CreateCommitteeAction = async (
  name: string
): Promise<Response<void>> => {
  try {
    console.log('Creating committee...');

    // Get the session to retrieve the access token
    const session = await getServerSession(authOptions);

    // Make a POST request to the backend to create a committee
    const response = await fetch(
      `http://backend:8080/Committee/CreateCommittee?name=${encodeURIComponent(name)}`,
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

    console.log('Committee created succesfully:', result);

    // Revalidate the path to update the committee list
    revalidatePath('/Admin/ManageCommittees');

    return { succeed: true, data: result };
  } catch (error) {
    console.error('Error creating committee:', error);

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
 * Renames an existing committee.
 *
 * @param {string} name - The current name of the committee.
 * @param {string} newName - The new name for the committee.
 * @returns {Promise<Response<void>>} - A promise that resolves to a response object indicating success or failure.
 */
export const RenameCommitteeAction = async (
  name: string,
  newName: string
): Promise<Response<void>> => {
  try {
    console.log('Renaming committee...');

    // Get the session to retrieve the access token
    const session = await getServerSession(authOptions);

    // Make a PUT request to the backend to rename the committee
    const response = await fetch(
      `http://backend:8080/Committee/RenameCommittee?name=${encodeURIComponent(name)}&newName=${encodeURIComponent(newName)}`,
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

    console.log('Committee renamed succesfully:', response);

    // Revalidate the path to update the committee list
    revalidatePath('/Admin/ManageCommittees');

    return { succeed: true };
  } catch (error) {
    console.error('Error renaming committee:', error);

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
 * Deletes a committee with the specified name.
 *
 * @param {string} name - The name of the committee to delete.
 * @returns {Promise<Response<void>>} - A promise that resolves to a response object indicating success or failure.
 */
export const DeleteCommittee = async (
  name: string
): Promise<Response<void>> => {
  try {
    console.log('Deleting committee...');

    // Get the session to retrieve the access token
    const session = await getServerSession(authOptions);

    // Make a DELETE request to the backend to delete the committee
    const response = await fetch(
      `http://backend:8080/Committee/DeleteCommittee?name=${encodeURIComponent(name)}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.accessToken || ''}`,
        },
      }
    );

    // Check if the response is ok (status code 200-299)
    if (!response.ok) {
      await ThrowResponseError(response);
    }

    console.log('Committee deleted succesfully:', response);

    // Revalidate the path to update the committee list
    revalidatePath('/Admin/ManageCommittees');

    return { succeed: true };
  } catch (error) {
    console.error('Error deleting committee:', error);

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
