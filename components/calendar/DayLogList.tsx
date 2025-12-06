
import React, { useMemo } from 'react';
import { Coffee, Trash2 } from 'lucide-react';
import { CaffeineLog } from '../../types';

interface DayLogListProps {
  logs: CaffeineLog[];
  selectedDate: Date;
  onRemoveLog: (id: string) => void;
}

const DayLogList: React.FC<DayLogListProps> = ({ logs, selectedDate, onRemoveLog }) => {
  const weekDays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

  // Helper
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // Get Logs for Selected Date
  const selectedDayLogs = useMemo(() => {
    return logs.filter(log => isSameDay(new Date(log.timestamp), selectedDate))
               .sort((a, b) => b.timestamp - a.timestamp);
  }, [logs, selectedDate]);

  const selectedDayTotal = selectedDayLogs.reduce((acc, log) => acc + log.amountMg, 0);

  return (
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
  );
};

export default DayLogList;
