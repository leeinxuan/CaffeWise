import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Coffee, Trash2, CalendarDays } from 'lucide-react';
import { CaffeineLog } from '../types';

interface CalendarViewProps {
  logs: CaffeineLog[];
  onRemoveLog: (id: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ logs, onRemoveLog }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Helper: check if two dates are same day
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

  // 3. Get Logs for Selected Date
  const selectedDayLogs = useMemo(() => {
    return logs.filter(log => isSameDay(new Date(log.timestamp), selectedDate))
               .sort((a, b) => b.timestamp - a.timestamp);
  }, [logs, selectedDate]);

  const selectedDayTotal = selectedDayLogs.reduce((acc, log) => acc + log.amountMg, 0);

  // Handlers
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleDayClick = (day: number, type: string) => {
    if (type === 'prev') {
       const newDate = new Date(year, month - 1, day);
       setCurrentDate(newDate);
       setSelectedDate(newDate);
    } else if (type === 'next') {
       const newDate = new Date(year, month + 1, day);
       setCurrentDate(newDate);
       setSelectedDate(newDate);
    } else {
       setSelectedDate(new Date(year, month, day));
    }
  };

  const weekDays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

  return (
    <div className="pb-24 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2">
        <CalendarDays className="text-[#8D6E63]" size={24} />
        <h2 className="text-xl font-bold text-[#6F4E37]">咖啡紀錄</h2>
      </div>

      {/* Calendar Card */}
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
             const isSelected = dateObj.type === 'current' && 
                                selectedDate.getDate() === dateObj.day && 
                                selectedDate.getMonth() === month &&
                                selectedDate.getFullYear() === year;
             
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

      {/* Selected Date Details */}
      <div className="space-y-3">
         <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex justify-between items-center">
            <div>
               <h4 className="text-orange-900 font-bold text-sm">
                 {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日 {weekDays[selectedDate.getDay()]}
               </h4>
               <p className="text-xs text-orange-700/70 mt-1">
                 這天有 {selectedDayLogs.length} 個紀錄，總計咖啡因 {selectedDayTotal} 毫克。
               </p>
            </div>
         </div>

         <div className="space-y-2">
            {selectedDayLogs.length > 0 ? (
              selectedDayLogs.map(log => (
                <div key={log.id} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <div className="bg-stone-50 p-2 rounded-full border border-stone-100">
                        <Coffee size={18} className="text-[#8D6E63]" />
                      </div>
                      <div>
                         <div className="text-sm font-bold text-stone-700">{log.name}</div>
                         <div className="text-xs text-stone-400">
                            {new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <span className="text-[#6F4E37] font-bold text-sm">{log.amountMg} <span className="text-xs font-normal text-stone-400">mg</span></span>
                      <button 
                        onClick={() => onRemoveLog(log.id)}
                        className="text-stone-300 hover:text-red-400 transition"
                      >
                         <Trash2 size={16} />
                      </button>
                   </div>
                </div>
              ))
            ) : (
               <div className="text-center py-10 opacity-50">
                  <Coffee size={32} className="mx-auto mb-2 text-stone-300" />
                  <p className="text-sm text-stone-400">這天沒有喝咖啡</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default CalendarView;