'use client';

import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { redirect, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

/**
 * LoginFailedContent component displays an error message when login fails.
 * It provides a link to the OAuth provider and a button to redirect to the login page.
 * It uses the search parameters to retrieve the error message.
 *
 * @returns {JSX.Element} LoginFailedContent component
 */
function LoginFailedContent() {
  const searchParams = useSearchParams();
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

/**
 * LoginFailedPage component is the main entry point for the login failed page.
 * It uses React's Suspense to handle loading states.
 *
 * @returns {JSX.Element} LoginFailedPage component
 */
export default function LoginFailedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginFailedContent />
    </Suspense>
  );
}
