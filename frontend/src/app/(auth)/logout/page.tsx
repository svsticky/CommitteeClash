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
    // handle the sign out process
    const handleSignOut = async () => {
      await signOut({ redirect: true, callbackUrl: '/loggedOut' });
    };

    // Call the sign out function
    handleSignOut();
  }, []);

  return 'Uitloggen...';
}
