'use client';

/**
 * NotFound component that displays a message when a page is not found.
 * This is a client-side component that handles 404 errors in the application.
 *
 * @returns {JSX.Element} A JSX element that contains the not found message.
 */
export default function NotFound() {
  return (
    <h1 className="text-2xl font-semibold">Oeps, deze pagina bestaat niet!</h1>
  );
}
