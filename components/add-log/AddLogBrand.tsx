
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BrandItem, CaffeineLog } from '../../types';
import { BRAND_DATABASE } from '../../constants';
import SymptomSelector from './SymptomSelector';

interface AddLogBrandProps {
  onAddLog: (name: string, amountMg: number, source: CaffeineLog['source'], customTimestamp?: number, symptoms?: string[]) => void;
  onBack: () => void;
}

const AddLogBrand: React.FC<AddLogBrandProps> = ({ onAddLog, onBack }) => {
  const [selectedBrand, setSelectedBrand] = useState<BrandItem | null>(null);
  const [selectedDrink, setSelectedDrink] = useState<BrandItem['items'][0] | null>(null);
  const [brandDrinkTime, setBrandDrinkTime] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  // Level 1: Brand Selection
  if (!selectedBrand) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="grid grid-cols-2 gap-3">
          {BRAND_DATABASE.map(brand => (
            <button
                key={brand.name}
                onClick={() => setSelectedBrand(brand)}
                className="p-4 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-300 text-left hover:border-indigo-500 hover:bg-slate-800 transition flex flex-col justify-center h-24 relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <span className="font-bold text-sm relative z-10">{brand.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Level 2: Drink Selection
  if (!selectedDrink) {
    return (
      <div className="animate-fade-in">
        <button 
          onClick={() => setSelectedBrand(null)}
          className="text-xs text-slate-400 mb-4 hover:text-white flex items-center gap-1 transition-colors px-1"
        >
          <ChevronLeft size={16} /> 返回品牌列表
        </button>
        <div className="bg-slate-800/80 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 bg-slate-800">
            <h3 className="text-lg font-bold text-indigo-400">{selectedBrand.name}</h3>
            <p className="text-xs text-slate-400 mt-1">請選擇飲品項目</p>
          </div>
          <div className="divide-y divide-slate-700/50">
            {selectedBrand.items.map(item => (
              <button
                key={item.name}
                onClick={() => setSelectedDrink(item)}
                className="w-full flex justify-between items-center p-4 hover:bg-slate-700/50 transition text-left group"
              >
                  <span className="text-sm font-medium text-slate-200 group-hover:text-white transition">{item.name}</span>
                  <div className="flex items-center text-slate-500 text-xs group-hover:text-indigo-400 transition">
                    <span>選擇容量</span>
                    <ChevronRight size={14} className="ml-1" />
                  </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Level 3: Size, Time & Symptoms
  return (
    <div className="animate-fade-in">
      <button 
        onClick={() => setSelectedDrink(null)}
        className="text-xs text-slate-400 mb-4 hover:text-white flex items-center gap-1 transition-colors px-1"
      >
        <ChevronLeft size={16} /> 返回飲品列表
      </button>
      <div className="bg-slate-800/80 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 bg-slate-800">
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 mb-1">{selectedBrand.name}</span>
              <h3 className="text-lg font-bold text-white">{selectedDrink.name}</h3>
            </div>
        </div>
        
        <div className="p-4 grid gap-4">
            {/* Drink Time */}
            <div>
              <label className="text-xs text-slate-400 font-bold uppercase block mb-2 ml-1">飲用時間</label>
              <input 
                type="datetime-local"
                value={brandDrinkTime}
                onChange={(e) => setBrandDrinkTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none appearance-none transition-colors"
              />
            </div>

            {/* Symptom Selector */}
            <SymptomSelector 
              selectedSymptoms={selectedSymptoms} 
              onChange={setSelectedSymptoms} 
            />
            
            <div className="h-px bg-slate-700/50 my-1"></div>
            
            <label className="text-xs text-slate-400 font-bold uppercase block ml-1">選擇容量 (點擊即新增)</label>
            <div className="grid gap-3">
              {selectedDrink.sizes.map(size => (
                <button
                  key={size.label}
                  onClick={() => {
                    const timestamp = new Date(brandDrinkTime).getTime();
                    onAddLog(`${selectedBrand.name} ${selectedDrink.name}`, size.mg, 'brand', timestamp, selectedSymptoms);
                  }}
                  className="flex items-center justify-between p-4 bg-slate-700/50 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20 rounded-xl border border-slate-600 hover:border-indigo-400 transition-all duration-300 group"
                >
                  <div className="flex flex-col text-left">
                    <span className="font-medium text-slate-200 group-hover:text-white">{size.label}</span>
                    <span className="text-xs text-slate-400 group-hover:text-indigo-200">約 {size.ml} ml</span>
                  </div>
                  <span className="font-bold text-indigo-300 group-hover:text-white text-lg">{size.mg} <span className="text-sm font-normal opacity-70">mg</span></span>
                </button>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AddLogBrand;
