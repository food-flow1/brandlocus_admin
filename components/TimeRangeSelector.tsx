'use client';

import React, { useState } from 'react';
import DateRangePicker, { DateRange } from './DateRangePicker';

export type { DateRange };
export type TimeRange = 'all' | '30days' | '7days' | '24hour';

export interface TimeRangeOption {
  id: TimeRange;
  label: string;
}

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  showDatePicker?: boolean;
  onDatePickerClick?: () => void;
  onDateRangeSelect?: (range: DateRange) => void;
  onDateRangeClear?: () => void;
  selectedDateRange?: DateRange;
  customRanges?: TimeRangeOption[];
}

const defaultRanges: TimeRangeOption[] = [
  { id: 'all', label: 'All Time' },
  { id: '30days', label: '30 Days' },
  { id: '7days', label: '7 Days' },
  { id: '24hour', label: '24 Hour' },
];

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  selectedRange,
  onRangeChange,
  showDatePicker = true,
  onDatePickerClick,
  onDateRangeSelect,
  onDateRangeClear,
  selectedDateRange,
  customRanges,
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const timeRanges = customRanges || defaultRanges;

  const handleDatePickerClick = () => {
    setIsDatePickerOpen(!isDatePickerOpen);
    if (onDatePickerClick) {
      onDatePickerClick();
    }
  };

  const handleDateRangeSelect = (range: DateRange) => {
    setIsDatePickerOpen(false);
    if (onDateRangeSelect) {
      onDateRangeSelect(range);
    }
  };

  const formatDateRange = () => {
    if (selectedDateRange?.startDate && selectedDateRange?.endDate) {
      const start = selectedDateRange.startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      const end = selectedDateRange.endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      return `${start} - ${end}`;
    }
    return null;
  };

  const hasDateRange = selectedDateRange?.startDate && selectedDateRange?.endDate;

  const handleClearDates = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDateRangeClear) {
      onDateRangeClear();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
      <div className="flex gap-1 sm:gap-2 border border-gray-200 rounded-lg p-0.5 sm:p-1 overflow-x-auto">
        {timeRanges.map((range) => (
          <button
            key={range.id}
            onClick={() => onRangeChange(range.id)}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${selectedRange === range.id
                ? 'bg-[#F0F1F3] text-gray-900'
                : 'bg-white text-gray-600 hover:bg-gray-50 cursor-pointer'
              }`}
          >
            {range.label}
          </button>
        ))}
      </div>
      {showDatePicker && (
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-auto">
            <button
              onClick={handleDatePickerClick}
              className={`flex border cursor-pointer rounded-lg items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors w-full sm:w-auto ${hasDateRange ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'}`}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.6667 2.66667H3.33333C2.59695 2.66667 2 3.26362 2 4V13.3333C2 14.0697 2.59695 14.6667 3.33333 14.6667H12.6667C13.403 14.6667 14 14.0697 14 13.3333V4C14 3.26362 13.403 2.66667 12.6667 2.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.6667 1.33333V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5.33333 1.33333V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 6.66667H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden sm:inline">{formatDateRange() || 'Select Dates'}</span>
              <span className="sm:hidden">{formatDateRange() || 'Dates'}</span>
            </button>
            <DateRangePicker
              isOpen={isDatePickerOpen}
              onClose={() => setIsDatePickerOpen(false)}
              onDateRangeSelect={handleDateRangeSelect}
              selectedRange={selectedDateRange}
              position="right"
            />
          </div>
          {hasDateRange && (
            <button
              onClick={handleClearDates}
              className="flex items-center justify-center p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Clear dates"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TimeRangeSelector;

