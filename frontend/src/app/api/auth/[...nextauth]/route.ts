import { createAuthOptions } from '@/lib/auth/authOptions';
import NextAuth from 'next-auth';

const handler = NextAuth(createAuthOptions());

/**
 * API route for NextAuth authentication.
 * This route handles authentication requests and returns the session or user data.
 * It uses the NextAuth library to manage authentication flows.
 * @param {NextRequest} req - The incoming request object.
 * @param {NextResponse} res - The outgoing response object.
 * @returns {Promise<NextResponse>} - A promise that resolves to a NextResponse containing
 */
export { handler as GET, handler as POST };
