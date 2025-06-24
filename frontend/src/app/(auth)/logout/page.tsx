'use client';

import { signOut } from 'next-auth/react';
import { useEffect } from 'react';

/**
 * SignOutPage component that handles user sign out.
 * This is a client-side component that uses NextAuth for authentication.
 *
 * @returns {JSX.Element} A message indicating the sign-out process is in progress.
 */
export default function SignOutPage() {
  useEffect(() => {
    // Get the redirect URL from the query parameters or default to '/loggedOut'
    const searchParams = new URLSearchParams(window.location.search);
    const redirectUrl = searchParams.get('redirect') || '/loggedOut';

    // handle the sign out process
    const handleSignOut = async () => {
      await signOut({ redirect: true, callbackUrl: redirectUrl });
    };

    // Call the sign out function
    handleSignOut();
  }, []);

  return 'Uitloggen...';
}
