'use client';

import { Button } from './ui/button';

/**
 * Pagination footer component for displaying page navigation controls.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {number} props.page - The current page number.
 * @param {number} props.pageAmount - The total number of pages.
 * @param {Function} props.updatePageAction - The function to call to update the page.
 * @returns {JSX.Element} The rendered pagination footer component.
 */
export default function PagedListFooterComponent({
  page,
  pageAmount,
  updatePageAction,
  className = '',
}: {
  page: number;
  pageAmount: number;
  updatePageAction: (page: number) => void;
  className?: string;
}) {
  return (
    <div className={`flex justify-between items-center w-full ${className}`}>
      {/* Previous button */}
      <Button onClick={() => updatePageAction(page - 1)} disabled={page === 1}>
        Previous
      </Button>

      {/* Current page indicator */}
      <span>
        {page}/{pageAmount}
      </span>

      {/* Next button */}
      <Button
        onClick={() => updatePageAction(page + 1)}
        disabled={page === pageAmount}
      >
        Next
      </Button>
    </div>
  );
}
