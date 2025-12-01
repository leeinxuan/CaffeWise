
import React, { useState } from 'react';
import { Coffee, Trash2, Edit2, X, AlertCircle } from 'lucide-react';
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
  onSOS: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ 
  currentLevel, 
  settings, 
  logs, 
  sleepClearTime, 
  status,
  onRemoveLog,
  onUpdateLog,
  onSOS
}) => {
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            CaffeWise
          </h1>
          <p className="text-xs text-slate-400">代謝監測中</p>
        </div>
        <button onClick={onSOS} className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/20 hover:bg-red-500/20 transition">
          SOS 救援
        </button>
      </header>

      {/* Main Gauge */}
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 shadow-xl backdrop-blur-sm">
        <MetabolicGauge currentMg={currentLevel} limitMg={settings.dailyLimitMg} status={status} />
        
        <div className="flex justify-between mt-4 text-center divide-x divide-slate-700">
          <div className="flex-1 px-2">
             <div className="text-xs text-slate-400 mb-1">目前狀態</div>
             <div className={`font-bold ${status === 'safe' ? 'text-green-400' : status === 'warning' ? 'text-orange-400' : 'text-red-400'}`}>
               {status === 'safe' ? '清醒/安全' : status === 'warning' ? '亢奮/警戒' : '危險/焦慮'}
             </div>
          </div>
          <div className="flex-1 px-2">
             <div className="text-xs text-slate-400 mb-1">預計代謝完畢</div>
             <div className="font-bold text-indigo-400">
               {sleepClearTime ? formatTime(sleepClearTime) : '現在'}
             </div>
          </div>
        </div>
      </div>

      {/* Sleep Forecast */}
      <SleepForecast clearTime={sleepClearTime} bedtime={settings.bedtime} />

      {/* Recent Activity */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">近期攝取紀錄</h3>
        <div className="space-y-3">
          {logs.length === 0 && <p className="text-slate-500 text-sm italic">今日尚無紀錄。</p>}
          {logs.slice(0, 5).map(log => (
            <div key={log.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-700 p-2 rounded-full">
                    <Coffee size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-200">{log.name}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} • 
                      {log.source === 'brand' ? '品牌資料庫' : log.source === 'manual' ? '手動輸入' : 'AI 辨識'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-300">{log.amountMg}mg</span>
                  <button onClick={() => onRemoveLog(log.id)} className="text-slate-600 hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {/* Symptoms Display */}
              <div className="flex flex-wrap items-center gap-2 ml-11">
                  {log.symptoms && log.symptoms.length > 0 ? (
                    log.symptoms.map(sId => {
                      const s = SYMPTOMS_LIST.find(item => item.id === sId);
                      return s ? (
                        <span key={sId} className="text-[10px] bg-red-900/30 text-red-300 px-2 py-0.5 rounded border border-red-900/50 flex items-center gap-1">
                          {s.icon} {s.label}
                        </span>
                      ) : null;
                    })
                  ) : (
                    <span className="text-[10px] text-slate-600">無不適症狀</span>
                  )}
                  <button 
                    onClick={() => setEditingLogId(log.id)}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded ml-auto flex items-center gap-1"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-800 w-full max-w-sm rounded-2xl border border-slate-700 p-5 shadow-2xl">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-white flex items-center gap-2">
                 <AlertCircle size={18} className="text-indigo-400" />
                 標記身體反應
               </h3>
               <button onClick={() => setEditingLogId(null)} className="text-slate-400 hover:text-white">
                 <X size={20} />
               </button>
             </div>
             
             <div className="grid grid-cols-2 gap-2 mb-6">
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
                      className={`p-3 rounded-lg border flex items-center justify-center gap-2 text-sm transition-all ${
                        isActive 
                          ? 'bg-red-500/20 border-red-500 text-white' 
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
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
               className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-500 transition"
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
