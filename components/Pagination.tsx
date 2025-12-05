'use client';

import React from 'react';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  maxVisiblePages = 3,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Calculate which page numbers to show
  const getVisiblePages = () => {
    const pages: number[] = [];
    const half = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - half);
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePrevious = () => {
    if (canGoPrevious) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    if (page !== currentPage) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between py-4">
      {/* Left side - Showing text */}
      <div className="text-sm text-gray-600">
        Showing {startItem}-{endItem} from {totalItems}
      </div>

      {/* Right side - Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
            canGoPrevious
              ? 'bg-[#D6D4F9] text-gray-700 hover:bg-[#D6D4F9] cursor-pointer'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          aria-label="Previous page"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Page number buttons */}
        {visiblePages.map((page) => {
          const isActive = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                isActive
                  ? 'bg-black text-white cursor-pointer'
                  : 'bg-[#D6D4F9] text-gray-900 cursor-pointer'
              }`}
              aria-label={`Page ${page}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
            canGoNext
              ? 'bg-purple-100 text-gray-700 hover:bg-purple-200 cursor-pointer'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          aria-label="Next page"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 12L10 8L6 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Pagination;