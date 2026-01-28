import { Button } from '@/components/ui';

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  filteredCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const PaginationControls = ({
  currentPage,
  totalPages,
  filteredCount,
  pageSize,
  onPageChange,
}: PaginationControlsProps) => {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, filteredCount);

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-text">
            Showing <span className="font-medium">{start}</span> to{' '}
            <span className="font-medium">{end}</span> of{' '}
            <span className="font-medium">{filteredCount}</span> results
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              Previous
            </Button>
            <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-text border border-border">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              Next
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
};


