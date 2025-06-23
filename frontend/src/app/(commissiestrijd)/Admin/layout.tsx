import { authOptions } from '@/lib/auth/authOptions';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

/**
 * Root layout for the admin section of the application.
 * This layout checks if the user is an admin before rendering the children components.
 *
 * @param {Object} props - The props for the layout component.
 * @param {React.ReactNode} props.children - The child components to render within this layout.
 * @returns {JSX.Element | null} - Returns the children if the user is an admin, otherwise redirects to the home page.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get the current session to check if the user is an admin
  const session = await getServerSession(authOptions);

  // If the user is not an admin, redirect to the home page
  if (!session?.is_admin) {
    redirect('/');
    return null;
  }

  return <>{children}</>;
}
