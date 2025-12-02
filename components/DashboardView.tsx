import React, { useState } from 'react';
import { Coffee, Trash2, Edit2, X, AlertCircle, Settings } from 'lucide-react';
import { CaffeineLog, UserSettings } from '../types';
import { SYMPTOMS_LIST } from '../constants';
import MetabolicGauge from './MetabolicGauge';
import SleepForecast from './SleepForecast';
import { formatTime } from '../utils/caffeineMath';

interface DashboardViewProps {
  currentLevel: number;
  settings: UserSettings;
  logs: CaffeineLog[];
  sleepClearTime: Date | null;
  status: 'safe' | 'warning' | 'danger';
  onRemoveLog: (id: string) => void;
  onUpdateLog: (id: string, updates: Partial<CaffeineLog>) => void;
  onOpenSettings: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ 
  currentLevel, 
  settings, 
  logs, 
  sleepClearTime, 
  status,
  onRemoveLog,
  onUpdateLog,
  onOpenSettings
}) => {
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  // Filter logs to show only today's activity
  const todayLogs = logs.filter(log => {
    const logDate = new Date(log.timestamp);
    const today = new Date();
    return logDate.getDate() === today.getDate() &&
           logDate.getMonth() === today.getMonth() &&
           logDate.getFullYear() === today.getFullYear();
  });

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#6F4E37]">
            CaffeWise
          </h1>
        </div>
        <button 
          onClick={onOpenSettings}
          className="p-2 bg-white rounded-full text-stone-500 shadow-sm border border-stone-100 hover:text-[#6F4E37] transition"
        >
          <Settings size={20} />
        </button>
      </header>

      {/* Main Gauge */}
      <div className="bg-white rounded-3xl p-6 shadow-xl shadow-stone-200/50 border border-stone-100">
        <MetabolicGauge currentMg={currentLevel} limitMg={settings.dailyLimitMg} status={status} />
        
        <div className="flex justify-between mt-4 text-center divide-x divide-stone-100">
          <div className="flex-1 px-2">
             <div className="text-xs text-stone-400 mb-1">目前狀態</div>
             <div className={`font-bold ${status === 'safe' ? 'text-green-600' : status === 'warning' ? 'text-orange-500' : 'text-red-500'}`}>
               {status === 'safe' ? '清醒/安全' : status === 'warning' ? '亢奮/警戒' : '危險/焦慮'}
             </div>
          </div>
          <div className="flex-1 px-2">
             <div className="text-xs text-stone-400 mb-1">預計代謝完畢</div>
             <div className="font-bold text-[#6F4E37]">
               {sleepClearTime ? formatTime(sleepClearTime) : '現在'}
             </div>
          </div>
        </div>
      </div>

      {/* Sleep Forecast */}
      <SleepForecast clearTime={sleepClearTime} bedtime={settings.bedtime} />

      {/* Today's Activity */}
      <div>
        <h3 className="text-sm font-semibold text-stone-500 mb-3 uppercase tracking-wider pl-1">今日攝取紀錄</h3>
        <div className="space-y-3">
          {todayLogs.length === 0 && <p className="text-stone-400 text-sm italic pl-1">今日尚無紀錄，來杯咖啡嗎？</p>}
          {todayLogs.map(log => (
            <div key={log.id} className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="bg-[#FFF8F0] p-2.5 rounded-full">
                    <Coffee size={18} className="text-[#8D6E63]" />
                  </div>
                  <div>
                    <div className="font-bold text-stone-700">{log.name}</div>
                    <div className="text-xs text-stone-400">
                      {new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} • 
                      {log.source === 'brand' ? '品牌資料庫' : log.source === 'manual' ? '手動輸入' : 'AI 辨識'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#6F4E37]">{log.amountMg}mg</span>
                  <button onClick={() => onRemoveLog(log.id)} className="text-stone-300 hover:text-red-400 transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {/* Symptoms Display */}
              <div className="flex flex-wrap items-center gap-2 ml-12">
                  {log.symptoms && log.symptoms.length > 0 ? (
                    log.symptoms.map(sId => {
                      const s = SYMPTOMS_LIST.find(item => item.id === sId);
                      return s ? (
                        <span key={sId} className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100 flex items-center gap-1 font-medium">
                          {s.icon} {s.label}
                        </span>
                      ) : null;
                    })
                  ) : (
                    <span className="text-[10px] text-stone-400">無不適症狀</span>
                  )}
                  <button 
                    onClick={() => setEditingLogId(log.id)}
                    className="text-[10px] text-[#8D6E63] hover:text-[#6F4E37] bg-[#F5F5F4] hover:bg-[#E7E5E4] px-2 py-0.5 rounded-full ml-auto flex items-center gap-1 transition-colors font-medium"
                  >
                    <Edit2 size={10} /> 紀錄反應
                  </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Symptom Editing Modal */}
      {editingLogId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
             <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-stone-800 flex items-center gap-2">
                 <AlertCircle size={20} className="text-[#8D6E63]" />
                 標記身體反應
               </h3>
               <button onClick={() => setEditingLogId(null)} className="text-stone-400 hover:text-stone-600">
                 <X size={20} />
               </button>
             </div>
             
             <div className="grid grid-cols-2 gap-3 mb-6">
                {SYMPTOMS_LIST.map(sym => {
                  const log = logs.find(l => l.id === editingLogId);
                  const isActive = log?.symptoms?.includes(sym.id);
                  return (
                    <button
                      key={sym.id}
                      onClick={() => {
                        if (!log) return;
                        const current = log.symptoms || [];
                        const updated = current.includes(sym.id) 
                          ? current.filter(id => id !== sym.id)
                          : [...current, sym.id];
                        onUpdateLog(log.id, { symptoms: updated });
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-sm transition-all shadow-sm ${
                        isActive 
                          ? 'bg-red-50 border-red-200 text-red-700 font-medium' 
                          : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                      }`}
                    >
                      <span>{sym.icon}</span>
                      <span>{sym.label}</span>
                    </button>
                  );
                })}
             </div>
             
             <button 
               onClick={() => setEditingLogId(null)}
               className="w-full bg-[#6F4E37] text-white py-3.5 rounded-xl font-bold hover:bg-[#5D4037] transition shadow-lg shadow-[#6F4E37]/20"
             >
               完成
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;