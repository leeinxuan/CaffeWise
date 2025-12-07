
import React, { useState } from 'react';
import { Zap, Camera, Heart, Edit2, Check, X } from 'lucide-react';
import { CaffeineLog } from '../../types';
import { analyzeImageForCaffeine } from '../../services/geminiService';
import SymptomSelector from './SymptomSelector';

interface AddLogAIProps {
  onAddLog: (name: string, amountMg: number, source: CaffeineLog['source'], customTimestamp?: number, symptoms?: string[]) => void;
  onBack: () => void;
  onSaveFavorite: (name: string, amountMg: number, source: CaffeineLog['source']) => void;
}

const AddLogAI: React.FC<AddLogAIProps> = ({ onAddLog, onSaveFavorite }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  // Inline Edit State
  const [editingField, setEditingField] = useState<'name' | 'mg' | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      
      const result = await analyzeImageForCaffeine(base64Data, file.type);
      setScanResult(result);
      setIsScanning(false);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSaveFavorite = () => {
    if (!scanResult) return;
    onSaveFavorite(scanResult.drinkName, scanResult.estimatedMg, 'ai');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const startEdit = (field: 'name' | 'mg') => {
    if (!scanResult) return;
    setEditingField(field);
    setEditValue(field === 'name' ? scanResult.drinkName : String(scanResult.estimatedMg));
  };

  const saveEdit = () => {
    if (!scanResult) return;
    if (editingField === 'name') {
       setScanResult({ ...scanResult, drinkName: editValue });
    } else if (editingField === 'mg') {
       setScanResult({ ...scanResult, estimatedMg: Number(editValue) });
    }
    setEditingField(null);
  };

  const cancelEdit = () => {
    setEditingField(null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h3 className="text-sm text-stone-500 font-semibold flex items-center gap-2">
          <Zap size={16} className="text-amber-500" /> AI 智慧鏡頭 (Gemini 2.5)
      </h3>
      
      {!scanResult ? (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-stone-300 border-dashed rounded-3xl cursor-pointer bg-white hover:bg-stone-50 transition">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isScanning ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6F4E37]"></div>
                ) : (
                  <>
                    <Camera className="w-12 h-12 text-stone-300 mb-3" />
                    <p className="text-sm text-stone-500 font-medium">拍攝菜單或營養標示</p>
                  </>
                )}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isScanning} />
        </label>
      ) : (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-lg animate-fade-in">
            
            {/* Header: Name */}
            <div className="flex justify-between items-start mb-2">
              {editingField === 'name' ? (
                <div className="flex items-center gap-2 flex-1">
                  <input 
                    type="text" 
                    value={editValue} 
                    onChange={e => setEditValue(e.target.value)}
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-lg font-bold text-stone-800 outline-none focus:border-[#8D6E63]"
                    autoFocus
                  />
                  <button onClick={saveEdit} className="p-1.5 bg-[#6F4E37] text-white rounded-full hover:bg-[#5D4037]">
                    <Check size={16} />
                  </button>
                  <button onClick={cancelEdit} className="p-1.5 bg-stone-200 text-stone-500 rounded-full hover:bg-stone-300">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full">
                  <h4 className="font-bold text-stone-800 text-lg leading-tight">{scanResult.drinkName}</h4>
                  <button 
                    onClick={() => startEdit('name')}
                    className="text-stone-400 hover:text-[#6F4E37] transition p-1 bg-stone-50 rounded-full hover:bg-stone-100 shrink-0"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              )}
            </div>
            
            {/* Caffeine Amount */}
            <div className="flex items-center gap-2 mb-4">
               {editingField === 'mg' ? (
                 <div className="flex items-center gap-2">
                    <div className="relative w-32">
                        <input 
                            type="number" 
                            value={editValue} 
                            onChange={e => setEditValue(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-3 pr-8 py-1 text-2xl font-bold text-[#6F4E37] outline-none focus:border-[#8D6E63]"
                            autoFocus
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-stone-400 font-normal">mg</span>
                    </div>
                    <button onClick={saveEdit} className="p-1.5 bg-[#6F4E37] text-white rounded-full hover:bg-[#5D4037]">
                        <Check size={16} />
                    </button>
                    <button onClick={cancelEdit} className="p-1.5 bg-stone-200 text-stone-500 rounded-full hover:bg-stone-300">
                        <X size={16} />
                    </button>
                 </div>
               ) : (
                 <>
                   <p className="text-3xl font-bold text-[#6F4E37]">{scanResult.estimatedMg} mg</p>
                   <button 
                      onClick={() => startEdit('mg')}
                      className="text-stone-400 hover:text-[#6F4E37] transition p-1 bg-stone-50 rounded-full hover:bg-stone-100"
                    >
                      <Edit2 size={16} />
                    </button>
                 </>
               )}
            </div>

            <p className="text-xs text-stone-500 mb-6 leading-relaxed bg-stone-50 p-3 rounded-xl">
               AI 分析：{scanResult.reasoning}
            </p>
            
            {/* Symptom Selector */}
            <div className="mb-6">
              <SymptomSelector 
                selectedSymptoms={selectedSymptoms} 
                onChange={setSelectedSymptoms} 
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => { setScanResult(null); setSelectedSymptoms([]); setEditingField(null); }}
                className="flex-1 py-3 text-sm font-medium text-stone-600 bg-stone-100 rounded-xl hover:bg-stone-200 transition"
              >
                重試
              </button>

              <button
                  onClick={handleSaveFavorite}
                  className={`p-3 rounded-xl border transition flex items-center justify-center
                  ${isSaved ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-stone-200 text-stone-400 hover:text-[#6F4E37] hover:border-[#6F4E37]'}
                  `}
              >
                  <Heart size={24} fill={isSaved ? "currentColor" : "none"} />
              </button>

              <button 
                onClick={() => onAddLog(scanResult.drinkName, scanResult.estimatedMg, 'ai', undefined, selectedSymptoms)}
                className="flex-1 py-3 text-sm font-bold text-white bg-[#6F4E37] rounded-xl hover:bg-[#5D4037] transition shadow-lg shadow-[#6F4E37]/20"
              >
                確認新增
              </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default AddLogAI;
