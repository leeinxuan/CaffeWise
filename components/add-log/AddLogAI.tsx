import React, { useState } from 'react';
import { Zap, Camera } from 'lucide-react';
import { CaffeineLog } from '../../types';
import { analyzeImageForCaffeine } from '../../services/geminiService';
import SymptomSelector from './SymptomSelector';

interface AddLogAIProps {
  onAddLog: (name: string, amountMg: number, source: CaffeineLog['source'], customTimestamp?: number, symptoms?: string[]) => void;
  onBack: () => void;
}

const AddLogAI: React.FC<AddLogAIProps> = ({ onAddLog }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

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
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-stone-800 text-lg">{scanResult.drinkName}</h4>
              <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-medium border border-amber-100">
                {scanResult.confidence} 可信度
              </span>
            </div>
            <p className="text-3xl font-bold text-[#6F4E37] mb-2">{scanResult.estimatedMg} mg</p>
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
                onClick={() => { setScanResult(null); setSelectedSymptoms([]); }}
                className="flex-1 py-3 text-sm font-medium text-stone-600 bg-stone-100 rounded-xl hover:bg-stone-200 transition"
              >
                重試
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