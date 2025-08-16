'use client';

import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { redirect } from 'next/navigation';

/**
 * LoggedOutPage component that displays a message after the user has logged out.
 * This is a client-side component that provides a button to log back in with the OAuth provider.
 *
 * * @returns {JSX.Element} A message indicating the user has logged out and a button to log back in.
 * */
export default function LoggedOutPage() {
  return (
    <>
      <Header />
      <div className="flex flex-col p-4">
        <p className="mb-4">
          Je bent nu uitgelogd. Je kunt nu weer inloggen via{' '}
          {process.env.NEXT_PUBLIC_OAUTH_PROVIDER_NAME}. Om een ander account te
          gebruiken, moet je zorgen dat je uitgelogd bent op{' '}
          <Link
            href={process.env.NEXT_PUBLIC_OAUTH_PROVIDER_URL!}
            className="text-theme hover:underline"
          >
            {process.env.NEXT_PUBLIC_OAUTH_PROVIDER_NAME}
          </Link>
          .
        </p>
        <Button onClick={() => redirect('/login')} className="mb-4 sm:w-45">
          Login met {process.env.NEXT_PUBLIC_OAUTH_PROVIDER_NAME}
        </Button>
      </div>
    </>
  );
}
