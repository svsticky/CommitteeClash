'use client';

import {
  CalendarRange,
  ChartBarDecreasing,
  ClipboardList,
  ListTodo,
  LogOut,
  Logs,
  Upload,
  UsersRound,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import MenuItem from './menu-item';

/**
 * Menu component that renders a vertical navigation menu with icons.
 * It includes links to various pages and conditionally displays admin options.
 *
 * @param {Object} props - The properties for the Menu component.
 * @param {boolean} [props.isAdmin=false] - Whether the user is an admin (shows additional menu items if true).
 * @returns {JSX.Element} The rendered Menu component.
 */
export default function Menu({ isAdmin = false }: { isAdmin?: boolean }) {
  // Get the current pathname from Next.js navigation, used to determine if menu item should be active
  const pathname = usePathname();

  // Ref to the menu element to measure its width and handle scrollbar
  const menuRef = useRef<HTMLDivElement>(null);

  // State to hold the width of the scrollbar, initialized to 0
  const [scrollbarWidth, setScrollbarWidth] = useState(0);

  // Effect to calculate the scrollbar width and update it when the component mounts
  useEffect(() => {
    // If the menuRef is not set, exit early
    if (!menuRef.current) return;

    // Get the current menu element from the ref
    const el = menuRef.current;

    // Function to calculate and update the scrollbar width based on the element's scroll height
    function updateScrollbarWidth() {
      const hasScrollbar = el.scrollHeight > el.clientHeight;
      const width = hasScrollbar ? el.offsetWidth - el.clientWidth : 0;
      setScrollbarWidth(width);
    }

    // Initial calculation of scrollbar width
    updateScrollbarWidth();

    // Add event listener to update scrollbar width on window resize
    window.addEventListener('resize', updateScrollbarWidth);

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', updateScrollbarWidth);
    };
  }, []);

  // Base width of the menu
  const baseWidth = 48;

  // Total width of the menu, including scrollbar width if present
  const totalWidth = baseWidth + scrollbarWidth;

  return (
    <div style={{ width: `${totalWidth}px`, minWidth: `${totalWidth}px` }}>
      {/* Vertical menu with fixed position, scrollable content, and dynamic width */}
      <div
        ref={menuRef}
        className="flex flex-col fixed top-12 left-0 bg-gray-100 overflow-y-auto overflow-x-hidden"
        style={{
          height: 'calc(100vh - 3rem)',
          width: `${totalWidth}px`,
        }}
      >
        <div className="flex flex-col items-center justify-center mt-2 gap-2">
          {/* Default menu items */}
          <MenuItem
            href="/"
            icon={ChartBarDecreasing}
            isActive={pathname === '/'}
          />
          <MenuItem
            href="/SubmitTask"
            icon={Upload}
            isActive={pathname === '/SubmitTask'}
          />
          <MenuItem
            href="/SubmittedTasks"
            icon={Logs}
            isActive={pathname === '/SubmittedTasks'}
          />

          {/* Conditional rendering of if user is admin menu items */}
          {isAdmin && (
            <>
              <div className="w-full border-t border-gray-300 my-2" />
              <MenuItem
                href="/Admin/ManageTasks"
                icon={ClipboardList}
                isActive={pathname.startsWith('/Admin/ManageTasks')}
              />
              <MenuItem
                href="/Admin/ManageSubmittedTasks"
                icon={ListTodo}
                isActive={pathname.startsWith('/Admin/ManageSubmittedTasks')}
              />
              <MenuItem
                href="/Admin/ManagePeriods"
                icon={CalendarRange}
                isActive={pathname.startsWith('/Admin/ManagePeriods')}
              />
              <MenuItem
                href="/Admin/ManageCommittees"
                icon={UsersRound}
                isActive={pathname.startsWith('/Admin/ManageCommittees')}
              />
            </>
          )}
        </div>

        {/* Bottom section with logout button */}
        <div className="mt-auto mb-2">
          <div className="w-full border-t border-gray-300 my-2" />
          <Link
            href="/logout"
            className="flex flex-col items-center cursor-pointer"
          >
            <LogOut className="w-10" />
          </Link>
        </div>
      </div>
    </div>
  );
}
