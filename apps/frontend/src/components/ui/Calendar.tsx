 'use client';

import { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  isBefore,
} from 'date-fns';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface CalendarProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  bookedRanges?: { start: Date; end: Date }[];
  readOnly?: boolean;
}

export default function Calendar({ value, onChange, bookedRanges = [], readOnly = false }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selecting, setSelecting] = useState<'start' | 'end'>('start');

  const isBooked = (day: Date) =>
    bookedRanges.some((range) =>
      isWithinInterval(day, { start: range.start, end: range.end })
    );

  const isSelected = (day: Date) => {
    if (!value) return false;
    if (value.start && isSameDay(day, value.start)) return true;
    if (value.end && isSameDay(day, value.end)) return true;
    return false;
  };

  const isInRange = (day: Date) => {
    if (!value?.start || !value?.end) return false;
    return isWithinInterval(day, { start: value.start, end: value.end });
  };

  const handleDayClick = (day: Date) => {
    if (readOnly || isBooked(day)) return;
    if (!onChange) return;

    if (selecting === 'start') {
      onChange({ start: day, end: null });
      setSelecting('end');
    } else {
      if (value?.start && isBefore(day, value.start)) {
        onChange({ start: day, end: null });
        setSelecting('end');
      } else {
        onChange({ ...value!, end: day });
        setSelecting('start');
      }
    }
  };

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const result: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      result.push(day);
      day = addDays(day, 1);
    }
    return result;
  }, [currentMonth]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 hover:bg-gray-100 rounded"
        >
          &#8249;
        </button>
        <span className="text-sm font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 hover:bg-gray-100 rounded"
        >
          &#8250;
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const booked = isBooked(day);
          const selected = isSelected(day);
          const inRange = isInRange(day);
          const inMonth = isSameMonth(day, currentMonth);

          return (
            <button
              type="button"
              key={i}
              disabled={!inMonth || booked || readOnly}
              onClick={() => handleDayClick(day)}
              className={`calendar-day ${!inMonth ? 'text-gray-300' : ''} ${
                booked ? 'booked' : ''
              } ${selected ? 'selected' : ''} ${inRange && !selected ? 'in-range' : ''}`}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>

      <div className="flex gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-600 inline-block" /> Selected
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-100 inline-block" /> Range
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-100 inline-block" /> Booked
        </span>
      </div>
    </div>
  );
}
