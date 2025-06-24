import Header from '@/components/header';
import Menu from '@/components/menu/menu';
import { authOptions } from '@/lib/auth/authOptions';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

/**
 * Root layout for the Commissiestrijd section of the application.
 * This layout checks if the user is authenticated before rendering the children components.
 *
 * @param {Object} props - The props for the layout component.
 * @param {React.ReactNode} props.children - The child components to render within this layout.
 * @returns {JSX.Element | null} - Returns the children if the user is authenticated, otherwise redirects to the login page.
 */
export default async function CommissiestrijdLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get the current session to check if the user is authenticated
  const session = await getServerSession(authOptions);

  // If the user is not authenticated, redirect to the login page
  if (session === null) {
    redirect(`/login`);
    return null;
  }

  // If the session has expired, logout to remove the session and redirect to the login page
  if (new Date(session.expires) < new Date()) {
    redirect(`/logout?redirect=${encodeURIComponent('/login')}`);
    return null;
  }

  return (
    <div className="flex flex-col w-screen h-screen">
      {/* Render the header */}
      <Header />

      <div className="flex w-full overflow-auto">
        {/* Render the menu, passing the isAdmin prop based on the session */}
        <Menu isAdmin={session.is_admin} />

        <div className="p-4 pb-0 w-full h-full">
          {/* Main content area with padding and scrollable content */}
          {children}

          {/* Empty footer for bottom padding in scrollview */}
          <div className="h-4 bg-transparent" />
        </div>
      </div>
    </div>
  );
}
