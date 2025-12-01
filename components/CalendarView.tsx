
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
        <CalendarDays className="text-indigo-400" size={24} />
        <h2 className="text-xl font-bold text-white">咖啡紀錄</h2>
      </div>

      {/* Calendar Card */}
      <div className="bg-slate-800 rounded-2xl p-4 shadow-xl border border-slate-700">
        
        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-4 px-2">
           <h3 className="text-lg font-bold text-white">
             {year}年 {month + 1}月
           </h3>
           <div className="flex gap-1">
             <button onClick={prevMonth} className="p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition">
               <ChevronLeft size={20} />
             </button>
             <button onClick={nextMonth} className="p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition">
               <ChevronRight size={20} />
             </button>
           </div>
        </div>

        {/* Weekday Header */}
        <div className="grid grid-cols-7 mb-2 text-center">
          {weekDays.map(d => (
            <div key={d} className="text-xs text-slate-500 font-medium py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-y-2">
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
                     w-9 h-9 rounded-full flex items-center justify-center text-sm relative transition-all
                     ${isSelected 
                        ? 'bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/30' 
                        : isCurrentMonth 
                          ? 'text-slate-300 hover:bg-slate-700' 
                          : 'text-slate-600'}
                   `}
                 >
                   {dateObj.day}
                   {hasLogs && !isSelected && (
                     <span className="absolute bottom-1 w-1 h-1 bg-orange-500 rounded-full"></span>
                   )}
                 </button>
               </div>
             );
           })}
        </div>
      </div>

      {/* Selected Date Details */}
      <div className="space-y-3">
         <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex justify-between items-center">
            <div>
               <h4 className="text-orange-400 font-bold text-sm">
                 {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日 {weekDays[selectedDate.getDay()]}
               </h4>
               <p className="text-xs text-slate-400 mt-1">
                 這天有 {selectedDayLogs.length} 個紀錄，總計咖啡因 {selectedDayTotal} 毫克。
               </p>
            </div>
         </div>

         <div className="space-y-2">
            {selectedDayLogs.length > 0 ? (
              selectedDayLogs.map(log => (
                <div key={log.id} className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <div className="bg-slate-700/50 p-2 rounded-lg">
                        <Coffee size={18} className="text-slate-400" />
                      </div>
                      <div>
                         <div className="text-sm font-bold text-white">{log.name}</div>
                         <div className="text-xs text-slate-500">
                            {new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <span className="text-orange-400 font-bold text-sm">{log.amountMg} <span className="text-xs font-normal text-slate-500">mg</span></span>
                      <button 
                        onClick={() => onRemoveLog(log.id)}
                        className="text-slate-600 hover:text-red-400 transition"
                      >
                         <Trash2 size={16} />
                      </button>
                   </div>
                </div>
              ))
            ) : (
               <div className="text-center py-8 opacity-50">
                  <Coffee size={32} className="mx-auto mb-2 text-slate-600" />
                  <p className="text-sm text-slate-500">這天沒有喝咖啡</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default CalendarView;
