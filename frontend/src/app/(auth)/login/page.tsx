'use client';

import { signIn } from 'next-auth/react';
import { useEffect } from 'react';

/**
 * SignInPage component that redirects the user to the Koala login page.
 * This is a client-side component that uses NextAuth for authentication.
 *
 * @returns {JSX.Element} A message indicating redirection to the Koala login page.
 */
export default function SignInPage() {
  useEffect(() => {
    // Check if the window object is available to avoid server-side rendering issues
    if (window) {
      // Redirect to the Koala login page
      signIn('sticky', { callbackUrl: '/' });
    }
  }, []);

  return 'Doorsturen naar koala login...';
}
