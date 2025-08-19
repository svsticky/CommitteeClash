import { createAuthOptions } from '@/lib/auth/authOptions';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to proxy image requests to the backend service.
 * It retrieves the image by filename and returns it with the appropriate content type.
 *
 * @param {NextRequest} req - The incoming request object.
 * @returns {Promise<NextResponse>} - A promise that resolves to a NextResponse containing the image data or an error message.
 */
export async function GET(req: NextRequest) {
  // Extract the filename from the query parameters
  const filename = req.nextUrl.searchParams.get('filename');

  // If filename is not provided, return a 400 Bad Request response
  if (!filename) {
    return new NextResponse(JSON.stringify({ error: 'Missing filename' }), {
      status: 400,
    });
  }

  try {
    // Get the session to retrieve the access token
    const session = await getServerSession(createAuthOptions());

    // Construct the backend URL to fetch the image
    const backendUrl = `http://backend:8080/Image/GetImage/${encodeURIComponent(filename)}`;

    // Make a GET request to the backend to fetch the image
    const res = await fetch(backendUrl, {
      headers: {
        Authorization: `Bearer ${session?.accessToken || ''}`,
      },
    });

    // Check if the response is ok (status code 200-299)
    if (!res.ok) {
      return new NextResponse(JSON.stringify({ error: 'Image fetch failed' }), {
        status: res.status,
      });
    }

    // Get the content type from the response headers and read the image data
    const contentType =
      res.headers.get('content-type') || 'application/octet-stream';
    const buffer = await res.arrayBuffer();

    // Convert the ArrayBuffer to a Buffer and return it as a NextResponse
    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: error }), {
      status: 500,
    });
  }
}
