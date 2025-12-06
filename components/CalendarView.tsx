
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Coffee, Trash2, CalendarDays, BookOpen, Lock, X, Check } from 'lucide-react';
import { CaffeineLog } from '../types';

interface CalendarViewProps {
  logs: CaffeineLog[];
  onRemoveLog: (id: string) => void;
  beanCount: number;
  waterLevel: number; // 0-3
  onHarvest: () => void;
}

// Recipes Configuration
const RECIPES = [
  { id: 1, name: "經典提拉米蘇", cost: 3, desc: "義大利國寶級甜點，手指餅乾吸飽濃縮咖啡與酒香。", color: "from-amber-700 to-amber-900" },
  { id: 2, name: "焦糖阿法奇朵", cost: 6, desc: "熱騰騰的 Espresso 澆淋在香草冰淇淋上，冰火交融。", color: "from-orange-400 to-amber-600" },
  { id: 3, name: "咖啡核桃布朗尼", cost: 10, desc: "濃郁巧克力中透著咖啡香氣，下午茶的最佳拍檔。", color: "from-stone-700 to-stone-900" },
  { id: 4, name: "摩卡戚風蛋糕", cost: 15, desc: "空氣般蓬鬆的蛋糕體，帶有淡淡的可可與咖啡苦甜。", color: "from-stone-500 to-stone-700" },
];

const CalendarView: React.FC<CalendarViewProps> = ({ logs, onRemoveLog, beanCount, waterLevel, onHarvest }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isRecipeOpen, setIsRecipeOpen] = useState(false);

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

  // --- Garden Visual Helpers (3D CSS Style) ---
  const renderPlant = () => {
    // Shared Soil Style (3D Mound)
    const Soil = () => (
      <div className="w-20 h-8 mx-auto relative z-10">
         {/* Main Mound */}
         <div className="absolute bottom-0 w-full h-full bg-gradient-to-b from-[#8D6E63] to-[#5D4037] rounded-t-full shadow-lg"></div>
         {/* Highlight on soil */}
         <div className="absolute top-1 left-4 w-6 h-2 bg-white/10 rounded-full blur-[2px]"></div>
      </div>
    );

    if (waterLevel === 0) {
      return (
        <div className="relative mt-8 animate-fade-in flex flex-col items-center justify-end h-32">
          {/* Seed buried */}
          <div className="w-2 h-2 bg-lime-200 rounded-full absolute bottom-7 left-1/2 -translate-x-1/2 z-0 animate-pulse"></div>
          <Soil />
          <p className="text-xs text-stone-400 mt-2 text-center font-medium">播種期</p>
        </div>
      );
    } else if (waterLevel === 1) {
      return (
        <div className="relative mt-4 animate-fade-in flex flex-col items-center justify-end h-32">
           {/* Plant Container */}
           <div className="relative z-0 mb-[-5px] animate-[wave_3s_ease-in-out_infinite] origin-bottom">
              {/* Stem */}
              <div className="w-2 h-10 bg-gradient-to-r from-lime-300 to-lime-500 mx-auto rounded-full"></div>
              {/* Tiny Leaves */}
              <div className="absolute top-0 left-1/2 -translate-x-full w-3 h-3 bg-gradient-to-br from-lime-300 to-green-500 rounded-tl-full rounded-br-full shadow-sm"></div>
              <div className="absolute top-1 left-1/2 w-2 h-2 bg-gradient-to-bl from-lime-300 to-green-500 rounded-tr-full rounded-bl-full shadow-sm"></div>
           </div>
           <Soil />
           <p className="text-xs text-stone-400 mt-2 text-center font-medium">發芽中 (1/3)</p>
        </div>
      );
    } else if (waterLevel === 2) {
      return (
        <div className="relative mt-2 animate-fade-in flex flex-col items-center justify-end h-32">
           {/* Plant Container */}
           <div className="relative z-0 mb-[-5px] animate-[wave_4s_ease-in-out_infinite] origin-bottom">
               {/* Stem */}
               <div className="w-2.5 h-16 bg-gradient-to-r from-lime-300 to-lime-600 mx-auto rounded-full"></div>
               
               {/* 3D Leaves - Left */}
               <div className="absolute top-2 -left-6 w-8 h-8 bg-gradient-to-br from-lime-300 via-green-400 to-green-600 rounded-tr-[2rem] rounded-bl-[2rem] shadow-lg rotate-[-20deg] flex items-center justify-center">
                  <div className="w-full h-full bg-white/10 rounded-tr-[2rem] rounded-bl-[2rem] absolute top-0 left-0 scale-90"></div>
               </div>
               
               {/* 3D Leaves - Right */}
               <div className="absolute top-4 -right-6 w-8 h-8 bg-gradient-to-bl from-lime-300 via-green-400 to-green-600 rounded-tl-[2rem] rounded-br-[2rem] shadow-lg rotate-[20deg] flex items-center justify-center">
                   <div className="w-full h-full bg-white/10 rounded-tl-[2rem] rounded-br-[2rem] absolute top-0 left-0 scale-90"></div>
               </div>
           </div>
           <Soil />
           <p className="text-xs text-stone-400 mt-2 text-center font-medium">成長中 (2/3)</p>
        </div>
      );
    } else {
      return (
        <div className="relative mt-0 animate-fade-in group cursor-pointer flex flex-col items-center justify-end h-32" onClick={onHarvest}>
           {/* Plant Container */}
           <div className="relative z-0 mb-[-5px] animate-[wave_5s_ease-in-out_infinite] origin-bottom">
               {/* Stem */}
               <div className="w-3 h-20 bg-gradient-to-r from-green-400 to-green-700 mx-auto rounded-full"></div>
               
               {/* 3D Leaves - Big */}
               <div className="absolute top-4 -left-8 w-10 h-10 bg-gradient-to-br from-lime-300 via-green-500 to-green-700 rounded-tr-[3rem] rounded-bl-[1rem] shadow-xl rotate-[-25deg]"></div>
               <div className="absolute top-8 -right-8 w-10 h-10 bg-gradient-to-bl from-lime-300 via-green-500 to-green-700 rounded-tl-[3rem] rounded-br-[1rem] shadow-xl rotate-[25deg]"></div>
               
               {/* Coffee Cherries (3D Glossy Spheres) */}
               <div className="absolute top-2 left-1/2 -translate-x-3 w-4 h-4 bg-[radial-gradient(circle_at_30%_30%,_#ff8a80,_#d32f2f)] rounded-full shadow-md animate-bounce"></div>
               <div className="absolute top-6 left-1/2 translate-x-1 w-4 h-4 bg-[radial-gradient(circle_at_30%_30%,_#ff8a80,_#c62828)] rounded-full shadow-md animate-bounce" style={{animationDelay: '0.1s'}}></div>
               <div className="absolute top-10 left-1/2 -translate-x-2 w-4 h-4 bg-[radial-gradient(circle_at_30%_30%,_#ff8a80,_#b71c1c)] rounded-full shadow-md animate-bounce" style={{animationDelay: '0.2s'}}></div>
           </div>
           
           <Soil />
           
           <button className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#6F4E37] text-white text-xs px-4 py-1.5 rounded-full shadow-xl font-bold animate-pulse hover:scale-110 transition z-20 border-2 border-white/20">
             點擊採收！
           </button>
        </div>
      );
    }
  };

  return (
    <div className="pb-24 space-y-6 animate-fade-in">
      {/* Header with Garden Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="text-[#8D6E63]" size={24} />
          <h2 className="text-xl font-bold text-[#6F4E37]">咖啡紀錄</h2>
        </div>
        <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsRecipeOpen(true)}
              className="bg-white border border-stone-200 text-[#6F4E37] p-2 rounded-full shadow-sm active:scale-95 transition"
            >
               <BookOpen size={20} />
            </button>
            <div className="bg-[#6F4E37] text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md shadow-[#6F4E37]/20">
               <div className="w-2 h-2 rounded-full bg-red-400"></div>
               <span className="font-bold text-sm">{beanCount}</span>
            </div>
        </div>
      </div>

      {/* --- Coffee Garden Section --- */}
      <div className="bg-gradient-to-b from-[#FFF8F0] to-white rounded-3xl p-5 border border-stone-100 shadow-sm relative overflow-hidden min-h-[220px]">
         <div className="flex justify-between items-start mb-2 relative z-10">
            <h3 className="text-sm font-bold text-[#6F4E37]">我的咖啡樹苗</h3>
            <span className="text-[10px] text-stone-400 bg-white/50 px-2 py-0.5 rounded-full">每喝 1 杯澆水 1 次</span>
         </div>
         
         {/* Background Decoration (Sun) */}
         <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-amber-100 rounded-full blur-xl opacity-60 pointer-events-none"></div>

         <div className="flex items-end justify-center pb-2">
            {renderPlant()}
         </div>

         {/* Progress Bar */}
         <div className="mt-4 flex gap-1 relative z-10">
             {[1, 2, 3].map(step => (
               <div 
                 key={step} 
                 className={`h-2 flex-1 rounded-full transition-all duration-500 shadow-sm ${
                   waterLevel >= step ? 'bg-blue-400' : 'bg-stone-100'
                 }`}
               ></div>
             ))}
         </div>
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

      {/* --- Recipe Book Modal --- */}
      {isRecipeOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-[#FFFBF7] w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
              {/* Modal Header */}
              <div className="bg-[#6F4E37] p-5 text-white flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <BookOpen size={20} />
                    <h3 className="font-bold text-lg">甜點食譜書</h3>
                 </div>
                 <button onClick={() => setIsRecipeOpen(false)} className="bg-white/10 p-1.5 rounded-full hover:bg-white/20 transition">
                    <X size={20} />
                 </button>
              </div>
              
              <div className="bg-amber-100/50 p-3 text-center border-b border-amber-100">
                 <p className="text-xs text-amber-800 font-medium">目前擁有 {beanCount} 顆咖啡豆，繼續努力！</p>
              </div>

              {/* Recipe List */}
              <div className="overflow-y-auto p-4 space-y-4">
                 {RECIPES.map(recipe => {
                    const isUnlocked = beanCount >= recipe.cost;
                    return (
                       <div key={recipe.id} className={`rounded-2xl border transition-all ${isUnlocked ? 'bg-white border-stone-200' : 'bg-stone-100 border-stone-100 opacity-80'}`}>
                          <div className={`h-24 w-full rounded-t-2xl bg-gradient-to-r ${isUnlocked ? recipe.color : 'from-stone-300 to-stone-400'} flex items-center justify-center relative overflow-hidden`}>
                             {!isUnlocked && (
                                <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-white">
                                   <Lock size={24} className="mb-1" />
                                   <span className="text-xs font-bold bg-black/40 px-2 py-0.5 rounded-full">需要 {recipe.cost} 顆豆子</span>
                                </div>
                             )}
                             {isUnlocked && (
                                <div className="absolute bottom-2 right-2 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-white text-xs font-bold border border-white/30 flex items-center gap-1">
                                  <Check size={12} /> 已解鎖
                                </div>
                             )}
                          </div>
                          <div className="p-4">
                             <h4 className="font-bold text-stone-800">{recipe.name}</h4>
                             <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                                {isUnlocked ? recipe.desc : "??? 繼續收集咖啡豆以解鎖此神秘食譜"}
                             </p>
                          </div>
                       </div>
                    );
                 })}
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default CalendarView;
