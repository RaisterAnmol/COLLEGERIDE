import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface CampusDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  className?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const CampusDatePicker: React.FC<CampusDatePickerProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current selected date
  const parsedDate = new Date(value || Date.now());
  const [viewYear, setViewYear] = useState(parsedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedDate.getMonth());

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Sync view when value changes
  useEffect(() => {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Generate days for grid
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const totalDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const totalDaysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  // Quick format helper
  const formatDateToISO = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const today = new Date();
  const todayISO = formatDateToISO(today.getFullYear(), today.getMonth(), today.getDate());

  const handleSelectDay = (dayNum: number) => {
    const iso = formatDateToISO(viewYear, viewMonth, dayNum);
    onChange(iso);
    setIsOpen(false);
  };

  const handleQuickSelect = (offsetDays: number) => {
    const target = new Date();
    target.setDate(target.getDate() + offsetDays);
    const iso = formatDateToISO(target.getFullYear(), target.getMonth(), target.getDate());
    onChange(iso);
    setIsOpen(false);
  };

  // Human-readable trigger text
  const formatTriggerDate = (dStr: string) => {
    try {
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return 'Select Date';
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
    } catch {
      return dStr;
    }
  };

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Trigger Button (Matches Tactile Neumorphic Styling) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full h-full flex items-center gap-2.5 text-left focus:outline-none cursor-pointer"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <CalendarIcon className="w-4 h-4 text-plum shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="block text-[10px] font-mono text-ink-muted uppercase font-bold tracking-wider">
            Commute Date
          </span>
          <div className="text-xs font-bold text-ink-primary font-mono truncate">
            {formatTriggerDate(value)}
          </div>
        </div>
      </button>

      {/* Tactile Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2.5 z-[100] w-72 sm:w-80 bg-white rounded-3xl border-2 border-slate-200/90 shadow-[0_25px_60px_rgba(0,0,0,0.22)] p-4 text-slate-800"
          >
            {/* Quick Pills (Today / Tomorrow / Weekend) */}
            <div className="flex items-center gap-1.5 pb-3 border-b border-slate-100">
              <button
                type="button"
                onClick={() => handleQuickSelect(0)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-mono font-bold transition-colors ${
                  value === todayISO
                    ? 'bg-[#582C4D] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect(1)}
                className="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-mono font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect(2)}
                className="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-mono font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                +2 Days
              </button>
            </div>

            {/* Month & Year Navigation Header */}
            <div className="flex items-center justify-between py-2.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-display font-bold text-sm text-slate-900">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Days of Week Headers */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] uppercase font-bold text-slate-400 py-1">
              {DAYS_SHORT.map((day) => (
                <div key={day} className="py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-mono">
              {/* Previous Month Padding */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => {
                const day = totalDaysInPrevMonth - firstDayOfWeek + i + 1;
                return (
                  <div key={`prev-${i}`} className="py-2 text-slate-300 pointer-events-none text-[11px]">
                    {day}
                  </div>
                );
              })}

              {/* Current Month Days */}
              {Array.from({ length: totalDaysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const thisDateISO = formatDateToISO(viewYear, viewMonth, dayNum);
                const isSelected = value === thisDateISO;
                const isToday = todayISO === thisDateISO;

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => handleSelectDay(dayNum)}
                    className={`py-2 rounded-xl text-[12px] font-bold transition-all flex items-center justify-center relative ${
                      isSelected
                        ? 'bg-[#582C4D] text-white shadow-md font-black scale-105'
                        : isToday
                        ? 'border border-[#582C4D] text-[#582C4D] font-black hover:bg-[#582C4D]/10'
                        : 'text-slate-800 hover:bg-[#582C4D]/10 hover:text-[#582C4D]'
                    }`}
                  >
                    <span>{dayNum}</span>
                    {isToday && !isSelected && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#582C4D]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Footer Info */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Verified Campus Transit</span>
              <span className="text-[#582C4D] font-bold">Select to Apply</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
