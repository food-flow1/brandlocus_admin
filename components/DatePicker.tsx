'use client';

import React, { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
  position?: 'left' | 'right';
}

const DatePicker: React.FC<DatePickerProps> = ({
  isOpen,
  onClose,
  onDateSelect,
  selectedDate,
  position = 'right',
}) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const [viewDate, setViewDate] = useState(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Convert Sunday (0) to 6, Monday (1) to 0
  };

  const goToPreviousMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setCurrentDate(newDate);
    if (onDateSelect) {
      onDateSelect(newDate);
    }
    onClose();
  };

  const isSelectedDate = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      viewDate.getMonth() === selectedDate.getMonth() &&
      viewDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      viewDate.getMonth() === today.getMonth() &&
      viewDate.getFullYear() === today.getFullYear()
    );
  };

  const daysInMonth = getDaysInMonth(viewDate);
  const firstDay = getFirstDayOfMonth(viewDate);
  const days: Array<{ day: number; isCurrentMonth: boolean; isPrevMonth?: boolean; isNextMonth?: boolean }> = [];

  // Get previous month's last days
  const prevMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 0);
  const prevMonthDays = prevMonth.getDate();

  // Add previous month's days
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      isPrevMonth: true,
    });
  }

  // Add current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({
      day,
      isCurrentMonth: true,
    });
  }

  // Fill remaining cells with next month's days (to complete the grid)
  const totalCells = 42; // 6 rows × 7 days
  const remainingCells = totalCells - days.length;
  for (let day = 1; day <= remainingCells; day++) {
    days.push({
      day,
      isCurrentMonth: false,
      isNextMonth: true,
    });
  }

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={`absolute ${position === 'right' ? 'right-0' : 'left-0'} top-full mt-2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80`}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Calendar</h3>
        
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Previous month"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-900">
            {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
          </span>
          <button
            onClick={goToNextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Next month"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((dateInfo, index) => {
          const { day, isCurrentMonth } = dateInfo;
          
          if (!isCurrentMonth) {
            return (
              <div
                key={`other-${index}`}
                className="text-center text-sm text-gray-300 py-2"
              >
                {day}
              </div>
            );
          }

          return (
            <button
              key={`day-${day}`}
              onClick={() => handleDateClick(day)}
              className={`text-center text-sm py-2 rounded transition-colors ${
                isSelectedDate(day)
                  ? 'bg-black text-white font-medium'
                  : isToday(day)
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DatePicker;

