'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isWithinInterval } from 'date-fns';

interface SalesDatePickerProps {
  dateRange: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
const YEARS = Array.from({ length: 11 }, (_, i) => 2020 + i);

export default function SalesDatePicker({ dateRange, onSelect }: SalesDatePickerProps) {
  const [viewDate, setViewDate] = useState(new Date());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Build the 6-row × 7-col calendar grid
  const buildGrid = () => {
    const start = startOfWeek(startOfMonth(viewDate));
    const end   = endOfWeek(endOfMonth(viewDate));
    const days: Date[] = [];
    let cur = start;
    while (cur <= end) {
      days.push(cur);
      cur = addDays(cur, 1);
    }
    // Pad to always have 6 rows (42 cells)
    while (days.length < 42) days.push(addDays(days[days.length - 1], 1));
    return days;
  };

  const days = buildGrid();

  const handleDayClick = (day: Date) => {
    if (!dateRange?.from || (dateRange.from && dateRange.to)) {
      // Start a new selection
      onSelect({ from: day, to: undefined });
    } else {
      // Complete the range
      if (day < dateRange.from) {
        onSelect({ from: day, to: dateRange.from });
      } else {
        onSelect({ from: dateRange.from, to: day });
      }
    }
  };

  const isStart   = (d: Date) => dateRange?.from && isSameDay(d, dateRange.from);
  const isEnd     = (d: Date) => dateRange?.to   && isSameDay(d, dateRange.to);
  const isToday   = (d: Date) => isSameDay(d, new Date());

  const isInRange = (d: Date) => {
    const from = dateRange?.from;
    const to   = dateRange?.to ?? hoverDate;
    if (!from || !to) return false;
    const [start, end] = from <= to ? [from, to] : [to, from];
    return isWithinInterval(d, { start, end }) && !isSameDay(d, start) && !isSameDay(d, end);
  };

  const inHoverRange = (d: Date) => {
    if (!dateRange?.from || dateRange.to || !hoverDate) return false;
    const [start, end] = dateRange.from <= hoverDate ? [dateRange.from, hoverDate] : [hoverDate, dateRange.from];
    return isWithinInterval(d, { start, end }) && !isSameDay(d, start) && !isSameDay(d, end);
  };

  return (
    <div className="w-full select-none">
      {/* ── NAVIGATION HEADER ── */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => setViewDate(subMonths(viewDate, 1))}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-blue-50 text-blue-900 transition-all active:scale-90"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          {/* Month dropdown */}
          <select
            value={viewDate.getMonth()}
            onChange={e => setViewDate(new Date(viewDate.getFullYear(), Number(e.target.value), 1))}
            className="text-[15px] font-black text-blue-900 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 cursor-pointer outline-none appearance-none text-center"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>

          {/* Year dropdown */}
          <select
            value={viewDate.getFullYear()}
            onChange={e => setViewDate(new Date(Number(e.target.value), viewDate.getMonth(), 1))}
            className="text-[15px] font-black text-blue-900 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 cursor-pointer outline-none appearance-none text-center"
          >
            {YEARS.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setViewDate(addMonths(viewDate, 1))}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-blue-50 text-blue-900 transition-all active:scale-90"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* ── DAY-OF-WEEK HEADERS ── */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(day => (
          <div key={day} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] py-2">
            {day}
          </div>
        ))}
      </div>

      {/* ── DATE GRID (6 rows × 7 cols) ── */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const start  = isStart(day);
          const end    = isEnd(day);
          const inRng  = isInRange(day) || inHoverRange(day);
          const today  = isToday(day);
          const dimmed = !isSameMonth(day, viewDate);

          return (
            <div
              key={idx}
              className={[
                'relative flex items-center justify-center h-10',
                // range middle highlight (no border-radius)
                inRng ? 'bg-blue-50' : '',
                // Left cap for range start
                start && (dateRange?.to || hoverDate) ? 'rounded-l-full' : '',
                // Right cap for range end
                end ? 'rounded-r-full' : '',
              ].join(' ')}
            >
              <button
                onClick={() => handleDayClick(day)}
                onMouseEnter={() => setHoverDate(day)}
                onMouseLeave={() => setHoverDate(null)}
                className={[
                  'w-9 h-9 flex items-center justify-center rounded-full text-[13px] font-bold transition-all z-10 relative',
                  // Selected start / end
                  start || end
                    ? 'bg-blue-900 text-white shadow-md shadow-blue-200'
                    : '',
                  // Today ring
                  today && !start && !end
                    ? 'ring-2 ring-blue-300 text-blue-800 font-black'
                    : '',
                  // Dimmed outside-month days
                  dimmed && !start && !end
                    ? 'text-gray-200'
                    : !start && !end
                    ? 'text-gray-700 hover:bg-blue-600 hover:text-white'
                    : '',
                ].join(' ')}
              >
                {format(day, 'd')}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
