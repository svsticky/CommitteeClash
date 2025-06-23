'use server';

import { authOptions } from '@/lib/auth/authOptions';
import { Response } from '@/types/Response';
import { getServerSession } from 'next-auth';

/**
 * Approves a submitted task with the specified ID, points, and maximum points per period.
 *
 * @param {string} id - The ID of the task to approve.
 * @param {number} points - The points to assign to the task.
 * @param {number | null} maxPerPeriod - The maximum points allowed per period, or null if not applicable.
 * @returns {Promise<Response<void>>} - A promise that resolves to a response object indicating success or failure.
 */
export const ApproveTask = async (
  id: string,
  points: number,
  maxPerPeriod: number | null
): Promise<Response<void>> => {
  try {
    console.log('Approving task...');

    // Get the session to retrieve the access token
    const session = await getServerSession(authOptions);

    // Make a PUT request to the backend to approve the task
    const response = await fetch(
      `http://backend:8080/SubmittedTask/ApproveTask?TaskId=${encodeURIComponent(id)}&points=${encodeURIComponent(points)}${maxPerPeriod === null ? '' : `&maxPerPeriod=${encodeURIComponent(maxPerPeriod)}`}`,
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

    console.log('Task approved successfully:', response);

    return { succeed: true };
  } catch (error) {
    console.error('Error approving task:', error);
    return {
      succeed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Rejects a submitted task with the specified ID and reason.
 *
 * @param {string} id - The ID of the task to reject.
 * @param {string} reason - The reason for rejecting the task.
 * @returns {Promise<Response<void>>} - A promise that resolves to a response object indicating success or failure.
 */
export const RejectTask = async (
  id: string,
  reason: string
): Promise<Response<void>> => {
  try {
    console.log('Rejecting task...');

    // Get the session to retrieve the access token
    const session = await getServerSession(authOptions);

    // Make a PUT request to the backend to reject the task
    const response = await fetch(
      `http://backend:8080/SubmittedTask/RejectTask?TaskId=${encodeURIComponent(id)}&reason=${encodeURIComponent(reason)}`,
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

    console.log('Task rejected successfully:', response);

    return { succeed: true };
  } catch (error) {
    console.error('Error rejecting task:', error);

    return {
      succeed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
