
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CaffeineLog } from '../../types';

interface CalendarGridProps {
  logs: CaffeineLog[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ logs, selectedDate, onSelectDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Helper
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // 1. Generate Calendar Grid Data
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Previous month filler
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const prevMonthDays = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    prevMonthDays.push({ day: daysInPrevMonth - i, type: 'prev' });
  }

  // Current month
  const currentMonthDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    currentMonthDays.push({ day: i, type: 'current' });
  }

  // Next month filler
  const totalSlots = 42; // 6 rows * 7 cols
  const nextMonthDays = [];
  const remainingSlots = totalSlots - (prevMonthDays.length + currentMonthDays.length);
  for (let i = 1; i <= remainingSlots; i++) {
    nextMonthDays.push({ day: i, type: 'next' });
  }

  const allCalendarDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  // 2. Identify days with logs
  const logsInMonthMap = useMemo(() => {
    const map = new Set<number>();
    logs.forEach(log => {
      const d = new Date(log.timestamp);
      if (d.getFullYear() === year && d.getMonth() === month) {
        map.add(d.getDate());
      }
    });
    return map;
  }, [logs, year, month]);

  // Handlers
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleDayClick = (day: number, type: string) => {
    if (type === 'prev') {
       const newDate = new Date(year, month - 1, day);
       setCurrentDate(newDate);
       onSelectDate(newDate);
    } else if (type === 'next') {
       const newDate = new Date(year, month + 1, day);
       setCurrentDate(newDate);
       onSelectDate(newDate);
    } else {
       onSelectDate(new Date(year, month, day));
    }
  };

  const weekDays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

  return (
    <div className="bg-white rounded-3xl p-5 shadow-lg shadow-stone-200/50 border border-stone-100">
      
      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-6 px-2">
         <h3 className="text-lg font-bold text-stone-800">
           {year}年 {month + 1}月
         </h3>
         <div className="flex gap-2">
           <button onClick={prevMonth} className="p-1 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-700 transition">
             <ChevronLeft size={22} />
           </button>
           <button onClick={nextMonth} className="p-1 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-700 transition">
             <ChevronRight size={22} />
           </button>
         </div>
      </div>

      {/* Weekday Header */}
      <div className="grid grid-cols-7 mb-2 text-center">
        {weekDays.map(d => (
          <div key={d} className="text-xs text-stone-400 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-y-3">
         {allCalendarDays.map((dateObj, idx) => {
           // We need to construct the full date to compare for "isSelected" correctly even across months
           // But since selectedDate is passed in, we can just check if this day matches selectedDate
           let thisDate: Date;
           if (dateObj.type === 'prev') thisDate = new Date(year, month - 1, dateObj.day);
           else if (dateObj.type === 'next') thisDate = new Date(year, month + 1, dateObj.day);
           else thisDate = new Date(year, month, dateObj.day);

           const isSelected = isSameDay(thisDate, selectedDate);
           
           const hasLogs = dateObj.type === 'current' && logsInMonthMap.has(dateObj.day);
           const isCurrentMonth = dateObj.type === 'current';

           return (
             <div key={idx} className="flex flex-col items-center">
               <button
                 onClick={() => handleDayClick(dateObj.day, dateObj.type)}
                 className={`
                   w-9 h-9 rounded-full flex items-center justify-center text-sm relative transition-all font-medium
                   ${isSelected 
                      ? 'bg-[#6F4E37] text-white shadow-lg shadow-[#6F4E37]/30' 
                      : isCurrentMonth 
                        ? 'text-stone-700 hover:bg-stone-100' 
                        : 'text-stone-300'}
                 `}
               >
                 {dateObj.day}
                 {hasLogs && !isSelected && (
                   <span className="absolute bottom-1.5 w-1 h-1 bg-[#8D6E63] rounded-full"></span>
                 )}
               </button>
             </div>
           );
         })}
      </div>
    </div>
  );
};

export default CalendarGrid;
