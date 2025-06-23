import Link from 'next/link';
import { ComponentType, SVGProps } from 'react';

/**
 * MenuItem component that renders a link with an icon.
 *
 * @param {Object} props - The properties for the MenuItem component.
 * @param {string} [props.href=''] - The URL to link to.
 * @param {ComponentType<SVGProps<SVGSVGElement>>} props.icon - The icon component to display.
 * @param {boolean} [props.isActive=false] - Whether the menu item is active (applies styles if true).
 * @returns {JSX.Element} The rendered MenuItem component.
 */
export default function MenuItem({
  href = '',
  icon: Icon,
  isActive,
}: {
  href?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  isActive?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`cursor-pointer py-2 rounded-xl ${isActive ? 'shadow bg-white' : ''}`}
    >
      <Icon className="w-10" />
    </Link>
  );
}
