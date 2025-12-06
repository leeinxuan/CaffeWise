import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Coffee, Trash2, Edit2, X, AlertCircle, Settings, Clock, Scale, ChevronRight } from 'lucide-react';
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
  // State for the log currently being edited (full object)
  const [editingLog, setEditingLog] = useState<CaffeineLog | null>(null);
  
  // Form states
  const [editAmount, setEditAmount] = useState<string>('');
  const [editTime, setEditTime] = useState<string>('');
  const [editSymptoms, setEditSymptoms] = useState<string[]>([]);

  // Populate form when a log is selected for editing
  useEffect(() => {
    if (editingLog) {
      setEditAmount(editingLog.amountMg.toString());
      
      // Convert timestamp to local datetime string for input[type="datetime-local"]
      const date = new Date(editingLog.timestamp);
      const tzOffset = date.getTimezoneOffset() * 60000;
      const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
      
      setEditTime(localISOTime);
      setEditSymptoms(editingLog.symptoms || []);
    }
  }, [editingLog]);

  const handleSaveEdit = () => {
    if (!editingLog) return;
    
    onUpdateLog(editingLog.id, {
      amountMg: Number(editAmount),
      timestamp: new Date(editTime).getTime(),
      symptoms: editSymptoms
    });
    setEditingLog(null);
  };

  const handleDeleteLog = () => {
    if (!editingLog) return;
    // Optional: confirm dialog could be added here
    onRemoveLog(editingLog.id);
    setEditingLog(null);
  };

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
            <button 
              key={log.id} 
              onClick={() => setEditingLog(log)}
              className="w-full bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-between group active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="bg-[#FFF8F0] p-2.5 rounded-full">
                  <Coffee size={18} className="text-[#8D6E63]" />
                </div>
                <div>
                  <div className="font-bold text-stone-700">{log.name}</div>
                  <div className="text-xs text-stone-400">
                    {new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} • 
                    {log.source === 'brand' ? '連鎖品牌' : log.source === 'manual' ? '手動輸入' : 'AI 辨識'}
                  </div>
                  
                  {/* Symptoms Display */}
                  <div className="flex flex-wrap items-center gap-1 mt-1.5">
                      {log.symptoms && log.symptoms.length > 0 ? (
                        log.symptoms.map(sId => {
                          const s = SYMPTOMS_LIST.find(item => item.id === sId);
                          return s ? (
                            <span key={sId} className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100 flex items-center gap-1 font-medium">
                              {s.icon} {s.label}
                            </span>
                          ) : null;
                        })
                      ) : null}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#6F4E37] text-lg">{log.amountMg}<span className="text-sm font-normal text-stone-400 ml-0.5">mg</span></span>
                <ChevronRight size={20} className="text-stone-300 group-hover:text-[#8D6E63] transition" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Comprehensive Edit Modal */}
      {editingLog && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setEditingLog(null)}>
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-stone-800 flex items-center gap-2 text-xl">
                 編輯紀錄
               </h3>
               <button onClick={() => setEditingLog(null)} className="p-1 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition">
                 <X size={24} />
               </button>
             </div>
            
             {/* Log Info */}
             <div className="flex justify-between items-center mb-6 pb-4 border-b border-stone-100">
                <span className="text-stone-500 font-medium">飲品</span>
                <span className="text-stone-800 font-bold text-right">{editingLog.name}</span>
             </div>

             <div className="space-y-5 mb-8">
                {/* Drinking Time Input - Merged Date/Time */}
                <div>
                   <label className="text-sm text-stone-500 font-bold block mb-2">飲用時間</label>
                   <input 
                     type="datetime-local"
                     value={editTime}
                     onChange={(e) => setEditTime(e.target.value)}
                     className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:border-[#8D6E63] outline-none font-bold text-base"
                   />
                </div>

                {/* Amount Input */}
                <div>
                   <label className="text-sm text-[#6F4E37] font-bold flex items-center gap-1 mb-2">
                     <Coffee size={14} /> 咖啡因含量
                   </label>
                   <div className="relative">
                     <input 
                       type="number"
                       value={editAmount}
                       onChange={(e) => setEditAmount(e.target.value)}
                       className="w-full bg-white border border-stone-200 rounded-2xl py-3 pl-4 pr-12 text-stone-800 focus:border-[#8D6E63] outline-none font-bold text-xl shadow-sm"
                     />
                     <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium">mg</span>
                   </div>
                </div>
                
                {/* Symptom Selector - Cleaned up */}
                <div>
                   <div className="mt-4">
                      <label className="text-xs text-stone-400 font-bold uppercase block mb-2">身體反應</label>
                      <div className="grid grid-cols-2 gap-2">
                          {SYMPTOMS_LIST.map(sym => {
                            const isActive = editSymptoms.includes(sym.id);
                            return (
                              <button
                                key={sym.id}
                                onClick={() => {
                                  const updated = isActive
                                    ? editSymptoms.filter(id => id !== sym.id)
                                    : [...editSymptoms, sym.id];
                                  setEditSymptoms(updated);
                                }}
                                className={`p-2 rounded-xl border flex items-center justify-center gap-2 text-xs transition-all ${
                                  isActive 
                                    ? 'bg-red-50 border-red-200 text-red-700 font-medium shadow-sm' 
                                    : 'bg-white border-stone-100 text-stone-400 hover:bg-stone-50'
                                }`}
                              >
                                <span>{sym.icon}</span>
                                <span>{sym.label}</span>
                              </button>
                            );
                          })}
                       </div>
                   </div>
                </div>
             </div>
             
             <div className="space-y-4">
                <button 
                  onClick={handleSaveEdit}
                  className="w-full bg-[#6F4E37] text-white py-4 rounded-2xl font-bold hover:bg-[#5D4037] transition shadow-lg shadow-[#6F4E37]/20 text-lg"
                >
                  儲存變更
                </button>

                <button 
                  onClick={handleDeleteLog}
                  className="w-full py-2 text-red-400 text-sm font-medium hover:text-red-600 transition flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  刪除此紀錄...
                </button>
             </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DashboardView;