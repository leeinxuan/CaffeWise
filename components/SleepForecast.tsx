import React from 'react';
import { formatTime } from '../utils/caffeineMath';
import { Moon, AlertTriangle, CheckCircle } from 'lucide-react';

interface SleepForecastProps {
  clearTime: Date | null;
  bedtime: string; // "23:00"
}

const SleepForecast: React.FC<SleepForecastProps> = ({ clearTime, bedtime }) => {
  if (!clearTime) return null;

  // Convert bedtime string to Date for today
  const [bHour, bMinute] = bedtime.split(':').map(Number);
  const bedDate = new Date();
  bedDate.setHours(bHour, bMinute, 0, 0);
  
  if (bedDate.getTime() < Date.now() - 12 * 60 * 60 * 1000) {
    bedDate.setDate(bedDate.getDate() + 1);
  }

  const isSafe = clearTime.getTime() <= bedDate.getTime();
  const diffHours = (clearTime.getTime() - Date.now()) / (1000 * 60 * 60);

  return (
    <div className={`mt-4 p-5 rounded-3xl border shadow-sm ${isSafe ? 'border-stone-100 bg-white' : 'border-red-100 bg-red-50'}`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${isSafe ? 'bg-orange-50 text-orange-400' : 'bg-red-100 text-red-500'}`}>
           <Moon size={22} />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-stone-700">睡眠預測</h3>
          <p className="text-sm text-stone-500 mt-0.5">
            {diffHours <= 0 
              ? "您現在可以安心入睡。" 
              : `預計 ${formatTime(clearTime)} 後可入睡`}
          </p>
        </div>
        <div>
           {isSafe ? (
             <CheckCircle className="text-[#8D6E63]" size={24} />
           ) : (
             <AlertTriangle className="text-red-500 animate-pulse" size={24} />
           )}
        </div>
      </div>
      {!isSafe && (
        <div className="mt-3 text-xs text-red-600 text-center bg-white/50 py-2 rounded-lg font-medium">
          ⚠️ 預計代謝完畢時間已超過您的目標就寢時間 {bedtime}
        </div>
      )}
    </div>
  );
};

export default SleepForecast;