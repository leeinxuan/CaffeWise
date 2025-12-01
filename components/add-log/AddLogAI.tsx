
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
      <h3 className="text-sm text-slate-400 font-semibold flex items-center gap-2">
          <Zap size={16} className="text-yellow-400" /> AI 智慧鏡頭 (Gemini 2.5)
      </h3>
      
      {!scanResult ? (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-800/50 hover:bg-slate-800 transition">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isScanning ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                ) : (
                  <>
                    <Camera className="w-10 h-10 text-slate-400 mb-3" />
                    <p className="text-sm text-slate-400">拍攝菜單或營養標示</p>
                  </>
                )}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isScanning} />
        </label>
      ) : (
        <div className="bg-slate-800 p-4 rounded-xl border border-indigo-500/50 animate-fade-in">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-white text-lg">{scanResult.drinkName}</h4>
              <span className="text-xs bg-indigo-900 text-indigo-200 px-2 py-0.5 rounded">
                {scanResult.confidence} 可信度
              </span>
            </div>
            <p className="text-3xl font-bold text-indigo-400 mb-2">{scanResult.estimatedMg} mg</p>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">{scanResult.reasoning}</p>
            
            {/* Symptom Selector */}
            <div className="mb-4">
              <SymptomSelector 
                selectedSymptoms={selectedSymptoms} 
                onChange={setSelectedSymptoms} 
              />
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => { setScanResult(null); setSelectedSymptoms([]); }}
                className="flex-1 py-3 text-sm text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
              >
                重試
              </button>
              <button 
                onClick={() => onAddLog(scanResult.drinkName, scanResult.estimatedMg, 'ai', undefined, selectedSymptoms)}
                className="flex-1 py-3 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition"
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
