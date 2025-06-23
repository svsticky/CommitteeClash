'use server';

import { authOptions } from '@/lib/auth/authOptions';
import { LeaderboardList } from '@/types/Leaderboard';
import { Period } from '@/types/Period';
import { Response } from '@/types/Response';
import { getServerSession } from 'next-auth';

/**
 * Fetches the leaderboard for a specified period from the backend.
 *
 * @param {Period} period - The period for which to fetch the leaderboard.
 * @returns {Promise<Response<LeaderboardList>>} - A promise that resolves to a response object containing the leaderboard data or an error message.
 */
export const GetLeaderboard = async (
  period: Period
): Promise<Response<LeaderboardList>> => {
  try {
    console.log('Getting leaderboard...');

    // Get the session to retrieve the access token
    const session = await getServerSession(authOptions);

    // Make a GET request to the backend to fetch the leaderboard
    const response = await fetch(
      `http://backend:8080/Leaderboard/GetLeaderboard?startDate=${period.startDate}&endDate=${period.endDate}`,
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

    console.log('Leaderboard loaded succesfully:', result);

    return { succeed: true, data: result };
  } catch (error) {
    console.error('Error getting leaderboard:', error);

    return {
      succeed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
