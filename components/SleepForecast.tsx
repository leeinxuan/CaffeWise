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
  
  // If bedtime is effectively "tomorrow" relative to now (e.g. it's 23:00 now and bedtime is 01:00)
  // Simplistic handling: if bedtime < now minus a buffer, assume tomorrow.
  if (bedDate.getTime() < Date.now() - 12 * 60 * 60 * 1000) {
    bedDate.setDate(bedDate.getDate() + 1);
  }

  const isSafe = clearTime.getTime() <= bedDate.getTime();
  const diffHours = (clearTime.getTime() - Date.now()) / (1000 * 60 * 60);

  return (
    <div className={`mt-4 p-4 rounded-xl border ${isSafe ? 'border-slate-700 bg-slate-800/50' : 'border-red-900/50 bg-red-900/10'}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${isSafe ? 'bg-indigo-500/20 text-indigo-400' : 'bg-red-500/20 text-red-400'}`}>
           <Moon size={20} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-slate-300">睡眠預測</h3>
          <p className="text-xs text-slate-400">
            {diffHours <= 0 
              ? "您現在可以安心入睡。" 
              : `預計 ${formatTime(clearTime)} 後可入睡`}
          </p>
        </div>
        <div>
           {isSafe ? (
             <CheckCircle className="text-green-500" size={20} />
           ) : (
             <AlertTriangle className="text-red-500 animate-pulse" size={20} />
           )}
        </div>
      </div>
      {!isSafe && (
        <div className="mt-2 text-xs text-red-400 text-center bg-red-950/30 py-1 rounded">
          ⚠️ 預計代謝完畢時間已超過您的目標就寢時間 {bedtime}。
        </div>
      )}
    </div>
  );
};

export default SleepForecast;