'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface DateRangePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onDateRangeSelect?: (range: DateRange) => void;
  selectedRange?: DateRange;
  position?: 'left' | 'right';
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  isOpen,
  onClose,
  onDateRangeSelect,
  selectedRange,
  position = 'right',
}) => {
  const [startDate, setStartDate] = useState<Date | null>(selectedRange?.startDate || null);
  const [endDate, setEndDate] = useState<Date | null>(selectedRange?.endDate || null);
  const [selectingStart, setSelectingStart] = useState(true);
  const [viewDate, setViewDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
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

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const goToPreviousMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const goToNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (selectingStart) {
      setStartDate(clickedDate);
      setEndDate(null);
      setSelectingStart(false);
    } else {
      if (clickedDate < startDate!) {
        setStartDate(clickedDate);
        setEndDate(startDate);
      } else {
        setEndDate(clickedDate);
      }
      setSelectingStart(true);
    }
  };

  const handleApply = () => {
    if (startDate && endDate && onDateRangeSelect) {
      onDateRangeSelect({ startDate, endDate });
    }
    onClose();
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectingStart(true);
  };

  const isStartDate = (day: number) => startDate && day === startDate.getDate() && viewDate.getMonth() === startDate.getMonth() && viewDate.getFullYear() === startDate.getFullYear();
  const isEndDate = (day: number) => endDate && day === endDate.getDate() && viewDate.getMonth() === endDate.getMonth() && viewDate.getFullYear() === endDate.getFullYear();
  const isInRange = (day: number) => {
    if (!startDate || !endDate) return false;
    const currentDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return currentDate > startDate && currentDate < endDate;
  };
  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear();
  };
  const formatDate = (date: Date | null) => date ? date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '--/--/----';

  const daysInMonth = getDaysInMonth(viewDate);
  const firstDay = getFirstDayOfMonth(viewDate);
  const days: Array<{ day: number; isCurrentMonth: boolean }> = [];
  const prevMonthDays = new Date(viewDate.getFullYear(), viewDate.getMonth(), 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) days.push({ day: prevMonthDays - i, isCurrentMonth: false });
  for (let day = 1; day <= daysInMonth; day++) days.push({ day, isCurrentMonth: true });
  const remainingCells = 42 - days.length;
  for (let day = 1; day <= remainingCells; day++) days.push({ day, isCurrentMonth: false });

  if (!isOpen) return null;

  return (
    <div ref={dropdownRef} className={`absolute ${position === 'right' ? 'right-0' : 'left-0'} top-full mt-2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Date Range</h3>
        <div className="flex items-center gap-2 mb-3">
          <div onClick={() => setSelectingStart(true)} className={`flex-1 px-3 py-2 rounded-lg border text-sm cursor-pointer ${selectingStart ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
            <div className="text-xs text-gray-500 mb-0.5">Start Date</div>
            <div className="font-medium">{formatDate(startDate)}</div>
          </div>
          <span className="text-gray-400">→</span>
          <div onClick={() => setSelectingStart(false)} className={`flex-1 px-3 py-2 rounded-lg border text-sm cursor-pointer ${!selectingStart ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
            <div className="text-xs text-gray-500 mb-0.5">End Date</div>
            <div className="font-medium">{formatDate(endDate)}</div>
          </div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <button onClick={goToPreviousMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100" aria-label="Previous month">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <span className="text-sm font-medium text-gray-900">{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
          <button onClick={goToNextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100" aria-label="Next month">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((dateInfo, index) => {
          const { day, isCurrentMonth } = dateInfo;
          if (!isCurrentMonth) return <div key={`other-${index}`} className="text-center text-sm text-gray-300 py-2">{day}</div>;
          const isStart = isStartDate(day);
          const isEnd = isEndDate(day);
          const inRange = isInRange(day);
          return (
            <button key={`day-${day}`} onClick={() => handleDateClick(day)} className={`text-center text-sm py-2 rounded transition-colors ${isStart || isEnd ? 'bg-blue-600 text-white font-medium' : inRange ? 'bg-blue-100 text-blue-800' : isToday(day) ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
              {day}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
        <button onClick={handleClear} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Clear</button>
        <button onClick={handleApply} disabled={!startDate || !endDate} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">Apply</button>
      </div>
    </div>
  );
};

export default DateRangePicker;

