
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { BrandItem, CaffeineLog } from '../../types';
import { BRAND_DATABASE } from '../../constants';
import SymptomSelector from './SymptomSelector';

interface AddLogBrandProps {
  onAddLog: (name: string, amountMg: number, source: CaffeineLog['source'], customTimestamp?: number, symptoms?: string[]) => void;
  onBack: () => void;
  onSaveFavorite: (name: string, amountMg: number, source: CaffeineLog['source']) => void;
}

const AddLogBrand: React.FC<AddLogBrandProps> = ({ onAddLog, onBack, onSaveFavorite }) => {
  const [selectedBrand, setSelectedBrand] = useState<BrandItem | null>(null);
  const [selectedDrink, setSelectedDrink] = useState<BrandItem['items'][0] | null>(null);
  const [selectedSize, setSelectedSize] = useState<{ label: string; mg: number; ml: number } | null>(null);
  
  const [brandDrinkTime, setBrandDrinkTime] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  // Helper to handle adding the log
  const handleConfirmAdd = () => {
    if (!selectedBrand || !selectedDrink || !selectedSize) return;

    const timestamp = new Date(brandDrinkTime).getTime();
    onAddLog(
      `${selectedBrand.name} ${selectedDrink.name}`, 
      selectedSize.mg, 
      'brand', 
      timestamp, 
      selectedSymptoms
    );
  };
  
  const handleSaveFavorite = () => {
    if (!selectedBrand || !selectedDrink || !selectedSize) return;
    onSaveFavorite(
      `${selectedBrand.name} ${selectedDrink.name}`, 
      selectedSize.mg, 
      'brand'
    );
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Level 1: Brand Selection
  if (!selectedBrand) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="grid grid-cols-2 gap-3">
          {BRAND_DATABASE.map(brand => (
            <button
                key={brand.name}
                onClick={() => setSelectedBrand(brand)}
                className="p-5 rounded-3xl border border-stone-200 bg-white text-stone-700 text-left hover:border-[#8D6E63] hover:shadow-md transition flex flex-col justify-center h-28 relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-[#FFF8F0] opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <span className="font-bold text-sm relative z-10 group-hover:text-[#6F4E37] transition">{brand.name}</span>
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
          className="text-xs text-stone-500 mb-4 hover:text-stone-800 flex items-center gap-1 transition-colors px-1"
        >
          <ChevronLeft size={16} /> 返回品牌列表
        </button>
        <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-stone-100 bg-stone-50/50">
            <h3 className="text-lg font-bold text-[#6F4E37]">{selectedBrand.name}</h3>
            <p className="text-xs text-stone-400 mt-1">請選擇飲品項目</p>
          </div>
          <div className="divide-y divide-stone-100">
            {selectedBrand.items.map(item => (
              <button
                key={item.name}
                onClick={() => {
                  setSelectedDrink(item);
                  setSelectedSize(null); // Reset size when picking a new drink
                }}
                className="w-full flex justify-between items-center p-5 hover:bg-stone-50 transition text-left group"
              >
                  <span className="text-sm font-medium text-stone-700 group-hover:text-[#5D4037] transition">{item.name}</span>
                  <div className="flex items-center text-stone-400 text-xs group-hover:text-[#8D6E63] transition">
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
        className="text-xs text-stone-500 mb-4 hover:text-stone-800 flex items-center gap-1 transition-colors px-1"
      >
        <ChevronLeft size={16} /> 返回飲品列表
      </button>
      <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden shadow-sm mb-20">
        <div className="p-5 border-b border-stone-100 bg-stone-50/50">
            <div className="flex flex-col">
              <span className="text-xs text-stone-400 mb-1">{selectedBrand.name}</span>
              <h3 className="text-lg font-bold text-stone-800">{selectedDrink.name}</h3>
            </div>
        </div>
        
        <div className="p-5 grid gap-5">
            {/* Drink Time */}
            <div>
              <label className="text-xs text-stone-400 font-bold uppercase block mb-2 ml-1">飲用時間</label>
              <input 
                type="datetime-local"
                value={brandDrinkTime}
                onChange={(e) => setBrandDrinkTime(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-800 focus:border-[#8D6E63] outline-none appearance-none transition-colors"
              />
            </div>

            {/* Symptom Selector */}
            <SymptomSelector 
              selectedSymptoms={selectedSymptoms} 
              onChange={setSelectedSymptoms} 
            />
            
            <div className="h-px bg-stone-100 my-1"></div>
            
            <label className="text-xs text-stone-400 font-bold uppercase block ml-1">選擇容量</label>
            <div className="grid gap-3">
              {selectedDrink.sizes.map(size => {
                const isSelected = selectedSize?.label === size.label;
                return (
                  <button
                    key={size.label}
                    onClick={() => setSelectedSize(size)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 group
                      ${isSelected 
                        ? 'bg-[#6F4E37] border-[#6F4E37] shadow-lg shadow-[#6F4E37]/20' 
                        : 'bg-stone-50 border-stone-200 hover:border-[#8D6E63] hover:bg-white'}
                    `}
                  >
                    <div className="flex flex-col text-left">
                      <span className={`font-medium ${isSelected ? 'text-white' : 'text-stone-700'}`}>{size.label}</span>
                      <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-stone-400'}`}>約 {size.ml} ml</span>
                    </div>
                    <span className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-[#8D6E63]'}`}>
                      {size.mg} <span className="text-sm font-normal opacity-70">mg</span>
                    </span>
                  </button>
                );
              })}
            </div>
            
            <div className="flex gap-3 mt-2">
               <button
                  disabled={!selectedSize}
                  onClick={handleSaveFavorite}
                  className={`p-4 rounded-xl border transition flex items-center justify-center
                    ${isSaved ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-stone-200 text-stone-400 hover:text-[#6F4E37] hover:border-[#6F4E37]'}
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
               >
                  <Heart size={24} fill={isSaved ? "currentColor" : "none"} />
               </button>
               
               {/* Confirm Button */}
               <button 
                 disabled={!selectedSize}
                 onClick={handleConfirmAdd}
                 className="flex-1 bg-[#6F4E37] disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold hover:bg-[#5D4037] transition shadow-lg shadow-[#6F4E37]/20"
               >
                 確認新增
               </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AddLogBrand;
