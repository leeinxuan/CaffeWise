import React, { useState } from 'react';
import { CaffeineLog } from '../../types';
import SymptomSelector from './SymptomSelector';

interface AddLogManualProps {
  onAddLog: (name: string, amountMg: number, source: CaffeineLog['source'], customTimestamp?: number, symptoms?: string[]) => void;
  onBack: () => void;
}

const AddLogManual: React.FC<AddLogManualProps> = ({ onAddLog }) => {
  const [manualMode, setManualMode] = useState<'general' | 'formula'>('general');
  const [manualAmount, setManualAmount] = useState('');
  const [manualName, setManualName] = useState('');
  const [volumeMl, setVolumeMl] = useState('');
  const [caffeinePercentage, setCaffeinePercentage] = useState('1.2');
  const [beanWeight, setBeanWeight] = useState('');
  const [drinkTime, setDrinkTime] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const handleManualSubmit = () => {
    const timestamp = new Date(drinkTime).getTime();
    const name = manualName || (volumeMl ? `飲品 (${volumeMl}ml)` : '手動紀錄');
    onAddLog(name, Number(manualAmount), 'manual', timestamp, selectedSymptoms);
  };

  const handleFormulaSubmit = () => {
    const mg = Math.round(Number(beanWeight) * Number(caffeinePercentage) * 10);
    const timestamp = new Date(drinkTime).getTime();
    const name = manualName || '手沖咖啡';
    onAddLog(name, mg, 'manual', timestamp, selectedSymptoms);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      
      {/* Manual Sub-tabs */}
      <div className="flex p-1 bg-white border border-stone-200 rounded-xl mb-4">
        <button
          onClick={() => setManualMode('general')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${manualMode === 'general' ? 'bg-[#6F4E37] text-white shadow-md' : 'text-stone-400 hover:text-stone-600'}`}
        >
          一般輸入
        </button>
        <button
          onClick={() => setManualMode('formula')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${manualMode === 'formula' ? 'bg-[#6F4E37] text-white shadow-md' : 'text-stone-400 hover:text-stone-600'}`}
        >
          公式計算
        </button>
      </div>

      {/* General Mode */}
      {manualMode === 'general' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="space-y-4">
            {/* Caffeine Amount */}
            <div>
              <label className="text-xs text-stone-400 uppercase font-bold tracking-wider block mb-2 ml-1">
                咖啡因含量 (mg)
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border border-stone-200 rounded-2xl pl-5 pr-12 py-4 text-stone-800 focus:outline-none focus:border-[#8D6E63] text-2xl font-bold shadow-sm"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-medium">mg</span>
              </div>
            </div>

            {/* Volume Input (Manual only) */}
            <div>
              <label className="text-xs text-stone-400 uppercase font-bold tracking-wider block mb-2 ml-1">
                飲用量 (ml)
              </label>
              <div className="relative mb-2">
                <input 
                  type="number" 
                  value={volumeMl}
                  onChange={(e) => setVolumeMl(e.target.value)}
                  placeholder="輸入容量 (例如：350)"
                  className="w-full bg-white border border-stone-200 rounded-xl pl-4 pr-10 py-3 text-sm text-stone-800 focus:outline-none focus:border-[#8D6E63]"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-xs">ml</span>
              </div>
            </div>

            {/* Name & Time */}
            <div className="grid gap-4">
                <div>
                    <label className="text-xs text-stone-400 font-bold uppercase block mb-1.5 ml-1">品項名稱</label>
                    <input 
                        type="text"
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        placeholder="例如：自製手沖"
                        className="w-full bg-white border border-stone-200 rounded-xl p-3 text-stone-800 focus:border-[#8D6E63] outline-none transition-colors"
                    />
                </div>
                
                <div>
                    <label className="text-xs text-stone-400 font-bold uppercase block mb-1.5 ml-1">飲用時間</label>
                    <input 
                        type="datetime-local"
                        value={drinkTime}
                        onChange={(e) => setDrinkTime(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl p-3 text-stone-800 focus:border-[#8D6E63] outline-none appearance-none transition-colors"
                    />
                </div>
            </div>

            {/* Symptom Selector */}
            <SymptomSelector 
              selectedSymptoms={selectedSymptoms} 
              onChange={setSelectedSymptoms} 
            />

            <button 
              disabled={!manualAmount}
              onClick={handleManualSubmit}
              className="w-full bg-[#6F4E37] disabled:opacity-50 text-white py-4 rounded-xl font-bold hover:bg-[#5D4037] transition shadow-lg shadow-[#6F4E37]/20"
            >
              確認新增
            </button>
          </div>
        </div>
      )}

      {/* Formula Mode */}
      {manualMode === 'formula' && (
        <div className="space-y-5 animate-fade-in">
          
          {/* Visual Formula */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
              <div className="text-center text-[#8D6E63] text-[10px] mb-4 font-mono tracking-widest opacity-80">
                ( 咖啡因濃度 % × 咖啡粉重 g ) × 1000 = 總量 mg
              </div>
              
              <div className="flex items-center justify-center gap-2 text-xl font-bold text-stone-700 flex-wrap">
                <span className="text-stone-300">(</span>
                <div className="relative w-16 sm:w-20">
                  <input
                    type="number"
                    value={caffeinePercentage}
                    onChange={(e) => setCaffeinePercentage(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded p-1 text-center focus:border-[#8D6E63] outline-none text-[#6F4E37]"
                    placeholder="1.2"
                  />
                  <span className="text-[10px] absolute -bottom-5 left-0 w-full text-center text-stone-400">濃度 %</span>
                </div>
                <span className="text-stone-300">×</span>
                <div className="relative w-16 sm:w-20">
                  <input
                    type="number"
                    value={beanWeight}
                    onChange={(e) => setBeanWeight(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded p-1 text-center focus:border-[#8D6E63] outline-none text-stone-800"
                    placeholder="0"
                  />
                  <span className="text-[10px] absolute -bottom-5 left-0 w-full text-center text-stone-400">粉重 g</span>
                </div>
                <span className="text-stone-300">)</span>
                <span className="text-stone-400 text-sm sm:text-lg">× 1000 = </span>
                <div className="relative min-w-[3ch]">
                  <span className="text-[#6F4E37] text-2xl border-b-2 border-[#6F4E37]">
                    {beanWeight && caffeinePercentage ? Math.round(Number(beanWeight) * Number(caffeinePercentage) * 10) : 0}
                  </span>
                  <span className="text-[10px] absolute -bottom-1.5 left-full ml-1 text-stone-400">mg</span>
                </div>
              </div>
          </div>

          {/* Extra Inputs */}
          <div className="grid gap-4">
              <div>
                  <label className="text-xs text-stone-400 font-bold uppercase block mb-1.5 ml-1">品項名稱</label>
                  <input 
                      type="text"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      placeholder="例如：手沖耶加雪菲"
                      className="w-full bg-white border border-stone-200 rounded-xl p-3 text-stone-800 focus:border-[#8D6E63] outline-none transition-colors"
                  />
              </div>
              
              <div>
                  <label className="text-xs text-stone-400 font-bold uppercase block mb-1.5 ml-1">飲用時間</label>
                  <input 
                      type="datetime-local"
                      value={drinkTime}
                      onChange={(e) => setDrinkTime(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl p-3 text-stone-800 focus:border-[#8D6E63] outline-none appearance-none transition-colors"
                  />
              </div>
          </div>

          {/* Symptom Selector */}
          <SymptomSelector 
            selectedSymptoms={selectedSymptoms} 
            onChange={setSelectedSymptoms} 
          />
          
          <button 
            disabled={!beanWeight}
            onClick={handleFormulaSubmit}
            className="w-full bg-[#6F4E37] disabled:opacity-50 text-white py-4 rounded-xl font-bold hover:bg-[#5D4037] transition shadow-lg shadow-[#6F4E37]/20 mt-2"
          >
            確認新增
          </button>
        </div>
      )}
    </div>
  );
};

export default AddLogManual;