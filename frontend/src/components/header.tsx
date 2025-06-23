import Image from 'next/image';
import Link from 'next/link';

/**
 * Header component that displays the Sticky logo and title.
 * It is styled with a background color and flexbox layout.
 *
 * @returns {JSX.Element} The rendered Header component.
 */
export default function Header() {
  return (
    <div className="h-12 min-h-12 w-full">
      {/* Bar in theme color */}
      <header className="bg-theme text-white flex items-center gap-4 p-2 h-12 fixed top-0 left-0 right-0 z-50">
        {/* Logo and title linked to home page */}
        <Link href="/" className="flex items-center">
          <Image
            src="https://public.svsticky.nl/logos/hoofd_outline_wit.svg"
            alt="Logo Sticky"
            width={30}
            height={30}
          />
          <h1 className="ml-4 text-lg font-bold">Commissiestrijd</h1>
        </Link>
      </header>
    </div>
  );
}
