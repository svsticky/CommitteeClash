import './globals.css';

export const metadata = {
  title: 'Commissiestrijd',
  icons: [
    {
      rel: 'icon',
      type: 'image/png',
      url: 'https://svsticky.nl/favicon-32x32.png?v=493e7616b0e8a256684f189691fc6faa',
    },
    {
      rel: 'icon',
      type: 'image/svg+xml',
      url: 'https://public.svsticky.nl/logos/hoofd_outline_kleur.svg',
    },
  ],
};

/**
 * RootLayout component that serves as the main layout for the application.
 * This component wraps the entire application content and provides a consistent
 * structure across all pages.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {React.ReactNode} props.children - The child components to be rendered within the layout.
 * @returns {JSX.Element} A JSX element that contains the children wrapped in a main element.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
