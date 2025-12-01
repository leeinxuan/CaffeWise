
import React, { useState } from 'react';
import { Database, Keyboard, Sparkles, ChevronLeft } from 'lucide-react';
import { CaffeineLog } from '../types';
import AddLogBrand from './add-log/AddLogBrand';
import AddLogManual from './add-log/AddLogManual';
import AddLogAI from './add-log/AddLogAI';

interface AddLogViewProps {
  onAddLog: (name: string, amountMg: number, source: CaffeineLog['source'], customTimestamp?: number, symptoms?: string[]) => void;
}

const AddLogView: React.FC<AddLogViewProps> = ({ onAddLog }) => {
  // Navigation State
  const [addTab, setAddTab] = useState<'menu' | 'brand' | 'manual' | 'ai'>('menu');

  // Return to menu handler
  const handleBack = () => setAddTab('menu');

  return (
    <div className="pb-24 space-y-6">
      <h2 className="text-xl font-bold text-white">紀錄咖啡因</h2>
      
      {/* View: Main Menu */}
      {addTab === 'menu' && (
        <div className="grid gap-4 animate-fade-in">
           <button 
             onClick={() => setAddTab('brand')}
             className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-left transition-all group shadow-lg"
           >
              <div className="flex items-start gap-4">
                 <div className="bg-amber-500/20 p-3 rounded-full text-amber-400 group-hover:scale-110 transition-transform">
                    <Database size={28} />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-white mb-1">品牌資料庫</h3>
                    <p className="text-sm text-slate-400">內建星巴克、超商咖啡數據，快速選取免查詢。</p>
                 </div>
              </div>
           </button>

           <button 
             onClick={() => setAddTab('manual')}
             className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-left transition-all group shadow-lg"
           >
              <div className="flex items-start gap-4">
                 <div className="bg-blue-500/20 p-3 rounded-full text-blue-400 group-hover:scale-110 transition-transform">
                    <Keyboard size={28} />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-white mb-1">手動輸入</h3>
                    <p className="text-sm text-slate-400">自訂數值，支援手沖計算與一般容量輸入。</p>
                 </div>
              </div>
           </button>

           <button 
             onClick={() => setAddTab('ai')}
             className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-left transition-all group shadow-lg"
           >
              <div className="flex items-start gap-4">
                 <div className="bg-purple-500/20 p-3 rounded-full text-purple-400 group-hover:scale-110 transition-transform">
                    <Sparkles size={28} />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-white mb-1">AI 辨識</h3>
                    <p className="text-sm text-slate-400">拍攝菜單或營養標示，由 Gemini AI 自動分析含量。</p>
                 </div>
              </div>
           </button>
        </div>
      )}

      {/* View: Specific Content */}
      {addTab !== 'menu' && (
        <div className="animate-fade-in">
           {/* Back to Menu Button */}
           <button 
             onClick={handleBack}
             className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors px-1"
           >
              <ChevronLeft size={20} />
              <span className="font-medium">返回選擇模式</span>
           </button>

           {addTab === 'brand' && (
             <AddLogBrand onAddLog={onAddLog} onBack={handleBack} />
           )}

           {addTab === 'manual' && (
             <AddLogManual onAddLog={onAddLog} onBack={handleBack} />
           )}

           {addTab === 'ai' && (
             <AddLogAI onAddLog={onAddLog} onBack={handleBack} />
           )}
        </div>
      )}
    </div>
  );
};

export default AddLogView;
