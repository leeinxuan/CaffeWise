
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
      <h2 className="text-xl font-bold text-white">個人設定</h2>
      
      <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 divide-y divide-slate-700">
         <div className="p-4 flex justify-between items-center">
            <span className="text-slate-300">每日上限 (mg)</span>
            <input 
              type="number" 
              value={settings.dailyLimitMg}
              onChange={(e) => setSettings({...settings, dailyLimitMg: Number(e.target.value)})}
              className="bg-slate-900 text-white rounded p-1 w-20 text-right"
            />
         </div>
         <div className="p-4 flex justify-between items-center">
            <span className="text-slate-300">目標就寢時間</span>
            <select
              value={settings.bedtime}
              onChange={(e) => setSettings({...settings, bedtime: e.target.value})}
              className="bg-slate-900 text-white rounded p-2 text-right border border-slate-700 outline-none focus:border-indigo-500"
            >
               {timeOptions.map(t => (
                   <option key={t} value={t}>{t}</option>
               ))}
            </select>
         </div>
         <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300">代謝速度設定</span>
              <span className="text-indigo-400 text-sm font-bold">{settings.halfLifeHours} 小時半衰期</span>
            </div>
            <input 
              type="range" 
              min="3" 
              max="10" 
              step="0.5"
              value={settings.halfLifeHours}
              onChange={(e) => setSettings({...settings, halfLifeHours: Number(e.target.value)})}
              className="w-full accent-indigo-500 h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
               <span>快代謝</span>
               <span>一般</span>
               <span>慢代謝</span>
            </div>
         </div>
      </div>

      <button 
        onClick={() => { localStorage.clear(); window.location.reload(); }}
        className="w-full py-3 text-red-400 border border-red-500/20 bg-red-500/10 rounded-xl text-sm font-bold hover:bg-red-500/20"
      >
        重置所有資料
      </button>
    </div>
  );
};

export default SettingsView;
