'use client';

import React, { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T | string;
  onRowSelect?: (selectedRows: T[]) => void;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  defaultSort?: {
    column: keyof T | string;
    direction: SortDirection;
  };
}

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  onRowSelect,
  onRowClick,
  selectable = true,
  defaultSort,
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [sortColumn, setSortColumn] = useState<keyof T | string | null>(
    defaultSort?.column || null
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    defaultSort?.direction || null
  );

  // Get unique identifier for each row
  const getRowId = (row: T): string | number => {
    if (typeof keyField === 'string') {
      return row[keyField];
    }
    return row[keyField as keyof T];
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(data.map((row) => getRowId(row)));
      setSelectedRows(allIds);
      if (onRowSelect) {
        onRowSelect(data);
      }
    } else {
      setSelectedRows(new Set());
      if (onRowSelect) {
        onRowSelect([]);
      }
    }
  };

  // Handle individual row selection
  const handleRowSelect = (row: T, checked: boolean, event?: React.MouseEvent) => {
    // Prevent row click when clicking checkbox
    if (event) {
      event.stopPropagation();
    }

    const rowId = getRowId(row);
    const newSelected = new Set(selectedRows);

    if (checked) {
      newSelected.add(rowId);
    } else {
      newSelected.delete(rowId);
    }

    setSelectedRows(newSelected);

    if (onRowSelect) {
      const selectedData = data.filter((r) => newSelected.has(getRowId(r)));
      onRowSelect(selectedData);
    }
  };

  // Handle row click
  const handleRowClick = (row: T) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  // Handle column sorting
  const handleSort = (columnKey: keyof T | string) => {
    if (sortColumn === columnKey) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn as keyof T];
      const bValue = b[sortColumn as keyof T];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection]);

  const allSelected = data.length > 0 && selectedRows.size === data.length;
  const someSelected = selectedRows.size > 0 && selectedRows.size < data.length;

  return (
    <div className="overflow-x-auto bg-white">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-200">
            {selectable && (
              <th className="px-4 py-4 text-left">
                <button
                  onClick={() => handleSelectAll(!allSelected)}
                  className="flex items-center justify-center w-5 h-5 rounded border border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                  aria-label={allSelected ? 'Deselect all' : 'Select all'}
                >
                  {allSelected ? (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="12" height="12" rx="2" fill="black" />
                      <path
                        d="M3 6L5.5 8.5L9 4"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : someSelected ? (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="12" height="12" rx="2" fill="black" />
                      <path
                        d="M3 6H9"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <div className="w-full h-full" />
                  )}
                </button>
              </th>
            )}
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="px-6 py-4 text-left text-base font-medium text-gray-700"
              >
                <button
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  className={`flex items-center gap-2 ${
                    column.sortable !== false ? 'cursor-pointer hover:text-gray-900' : ''
                  }`}
                  disabled={column.sortable === false}
                >
                  <span>{column.label}</span>
                  {column.sortable !== false && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`transition-transform ${
                        sortColumn === column.key && sortDirection === 'desc'
                          ? 'rotate-180'
                          : ''
                      }`}
                    >
                      <path
                        d="M3 4.5L6 1.5L9 4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={
                          sortColumn === column.key
                            ? 'text-gray-900'
                            : 'text-gray-400'
                        }
                      />
                    </svg>
                  )}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => {
            const rowId = getRowId(row);
            const isSelected = selectedRows.has(rowId);
            const isEvenRow = index % 2 !== 0;

            return (
              <tr
                key={rowId}
                onClick={() => handleRowClick(row)}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  isEvenRow ? 'bg-gray-50' : ''
                } ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {selectable && (
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleRowSelect(row, !isSelected, e)}
                      className={`flex items-center justify-center w-5 h-5 rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                        isSelected
                          ? 'bg-black border-black'
                          : 'bg-white border-gray-300 hover:border-gray-400'
                      }`}
                      aria-label={isSelected ? 'Deselect row' : 'Select row'}
                    >
                      {isSelected && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3 6L5.5 8.5L9 4"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  </td>
                )}
                {columns.map((column) => {
                  const value = row[column.key as keyof T];
                  return (
                    <td key={String(column.key)} className="px-4 py-4 text-base text-gray-700">
                      {column.render ? column.render(value, row) : String(value || '')}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {sortedData.length === 0 && (
        <div className="px-4 py-8 text-center text-gray-500">
          No data available
        </div>
      )}
    </div>
  );
}

export default DataTable;

