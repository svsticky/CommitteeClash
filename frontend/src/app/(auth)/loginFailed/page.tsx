'use client';

import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { redirect } from 'next/navigation';

/**
 * LoginFailedPage component that displays a message after the login process has failed.
 * This is a client-side component that provides a button to log back in with Koala.
 *
 * @returns {JSX.Element} A message indicating the login failure and a button to log in again.
 * */
export default function LoginFailedPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const errorMessage =
    searchParams.get('error') || 'Something went wrong during login.';
  console.error(errorMessage);

  return (
    <>
      <Header />
      <div className="flex flex-col p-4">
        <p className="mb-4">
          Er is iets misgegaan met inloggen. Je kunt nu weer inloggen via Koala.
          Blijf je op deze pagina terecht komen, probeer dan eerst uit te loggen
          op{' '}
          <Link
            href={process.env.NEXT_PUBLIC_OAUTH_PROVIDER_URL!}
            className="text-theme hover:underline"
          >
            Koala
          </Link>
          .
        </p>
        <Button onClick={() => redirect('/login')} className="mb-4 sm:w-45">
          Login met Koala
        </Button>
      </div>
    </>
  );
}
