/**
 * AuthLayout component that serves as a layout for authentication-related pages.
 * This component is used to wrap the content of authentication pages
 * such as login and logout.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {React.ReactNode} props.children - The child components to be rendered within the
 * @returns {JSX.Element} A JSX element that contains the children wrapped in a div with padding.
 */
export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="p4">{children}</div>;
}
