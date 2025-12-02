import React from 'react';
import { UserSettings } from '../types';

interface SettingsViewProps {
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, setSettings }) => {
  // Generate time options for dropdown (00:00 to 23:30)
  const timeOptions = [];
  for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0');
      timeOptions.push(`${hour}:00`);
      timeOptions.push(`${hour}:30`);
  }

  return (
    <div className="pb-24 space-y-6">
      <h2 className="text-xl font-bold text-[#6F4E37]">個人設定</h2>
      
      <div className="bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm divide-y divide-stone-100">
         <div className="p-5 flex justify-between items-center">
            <span className="text-stone-600 font-medium">每日上限 (mg)</span>
            <input 
              type="number" 
              value={settings.dailyLimitMg}
              onChange={(e) => setSettings({...settings, dailyLimitMg: Number(e.target.value)})}
              className="bg-stone-50 text-stone-800 rounded-lg p-2 w-24 text-right font-bold border border-stone-200 outline-none focus:border-[#8D6E63]"
            />
         </div>
         <div className="p-5 flex justify-between items-center">
            <span className="text-stone-600 font-medium">目標就寢時間</span>
            <select
              value={settings.bedtime}
              onChange={(e) => setSettings({...settings, bedtime: e.target.value})}
              className="bg-stone-50 text-stone-800 rounded-lg p-2 text-right border border-stone-200 outline-none focus:border-[#8D6E63]"
            >
               {timeOptions.map(t => (
                   <option key={t} value={t}>{t}</option>
               ))}
            </select>
         </div>
         <div className="p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-stone-600 font-medium">代謝速度設定</span>
              <span className="text-[#8D6E63] text-sm font-bold">{settings.halfLifeHours} 小時半衰期</span>
            </div>
            <input 
              type="range" 
              min="3" 
              max="10" 
              step="0.5"
              value={settings.halfLifeHours}
              onChange={(e) => setSettings({...settings, halfLifeHours: Number(e.target.value)})}
              className="w-full accent-[#6F4E37] h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-stone-400 mt-2">
               <span>快代謝</span>
               <span>一般</span>
               <span>慢代謝</span>
            </div>
         </div>
      </div>

      <button 
        onClick={() => { localStorage.clear(); window.location.reload(); }}
        className="w-full py-4 text-red-500 border border-red-100 bg-white rounded-2xl text-sm font-bold hover:bg-red-50 transition shadow-sm"
      >
        重置所有資料
      </button>
    </div>
  );
};

export default SettingsView;