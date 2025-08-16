'use client';

import { signIn } from 'next-auth/react';
import { useEffect } from 'react';

/**
 * SignInPage component that redirects the user to the OAuth provider login page.
 * This is a client-side component that uses NextAuth for authentication.
 *
 * @returns {JSX.Element} A message indicating redirection to the OAuth provider login page.
 */
export default function SignInPage() {
  useEffect(() => {
    // Check if the window object is available to avoid server-side rendering issues
    if (window) {
      // Redirect to the OAuth provider login page
      signIn(process.env.NEXT_PUBLIC_OAUTH_PROVIDER_NAME!, {
        callbackUrl: '/',
      });
    }
  }, []);

  return `Doorsturen naar ${process.env.NEXT_PUBLIC_OAUTH_PROVIDER_NAME} login...`;
}
