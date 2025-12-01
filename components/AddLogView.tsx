import React, { useState } from 'react';
import { Database, Keyboard, Sparkles, ChevronLeft, ChevronRight, Zap, Camera } from 'lucide-react';
import { BrandItem, CaffeineLog } from '../types';
import { BRAND_DATABASE } from '../constants';
import { analyzeImageForCaffeine } from '../services/geminiService';

interface AddLogViewProps {
  onAddLog: (name: string, amountMg: number, source: CaffeineLog['source'], customTimestamp?: number) => void;
}

const AddLogView: React.FC<AddLogViewProps> = ({ onAddLog }) => {
  // Navigation State
  const [addTab, setAddTab] = useState<'menu' | 'brand' | 'manual' | 'ai'>('menu');
  
  // Brand Mode State
  const [selectedBrand, setSelectedBrand] = useState<BrandItem | null>(null);
  const [selectedDrink, setSelectedDrink] = useState<BrandItem['items'][0] | null>(null);
  const [brandDrinkTime, setBrandDrinkTime] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  
  // Manual Mode State
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

  // AI Mode State
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  // --- Handlers ---

  const handleManualSubmit = () => {
    const timestamp = new Date(drinkTime).getTime();
    const name = manualName || (volumeMl ? `飲品 (${volumeMl}ml)` : '手動紀錄');
    onAddLog(name, Number(manualAmount), 'manual', timestamp);
  };

  const handleFormulaSubmit = () => {
    const mg = Math.round(Number(beanWeight) * Number(caffeinePercentage) * 10);
    const timestamp = new Date(drinkTime).getTime();
    const name = manualName || '手沖咖啡';
    onAddLog(name, mg, 'manual', timestamp);
  };

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
             onClick={() => { setAddTab('ai'); setScanResult(null); }}
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
             onClick={() => setAddTab('menu')}
             className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors px-1"
           >
              <ChevronLeft size={20} />
              <span className="font-medium">返回選擇模式</span>
           </button>

           {/* Brand View */}
           {addTab === 'brand' && (
              <div className="space-y-4 animate-fade-in">
                {!selectedBrand ? (
                  // Level 1: Select Brand
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
                ) : !selectedDrink ? (
                  // Level 2: Select Drink
                  <div className="animate-fade-in">
                    <button 
                      onClick={() => { setSelectedBrand(null); }}
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
                ) : (
                  // Level 3: Select Size & Time (Action)
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
                          {/* Drink Time Picker for Brand Mode */}
                          <div>
                            <label className="text-xs text-slate-400 font-bold uppercase block mb-2 ml-1">飲用時間</label>
                            <input 
                              type="datetime-local"
                              value={brandDrinkTime}
                              onChange={(e) => setBrandDrinkTime(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none appearance-none transition-colors"
                            />
                          </div>
                          
                          <div className="h-px bg-slate-700/50 my-1"></div>
                          
                          <label className="text-xs text-slate-400 font-bold uppercase block ml-1">選擇容量</label>
                          <div className="grid gap-3">
                            {selectedDrink.sizes.map(size => (
                              <button
                                key={size.label}
                                onClick={() => {
                                  const timestamp = new Date(brandDrinkTime).getTime();
                                  onAddLog(`${selectedBrand.name} ${selectedDrink.name}`, size.mg, 'brand', timestamp);
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
                )}
              </div>
           )}

           {/* Manual Input View */}
           {addTab === 'manual' && (
              <div className="space-y-4 animate-fade-in">
                
                {/* Manual Sub-tabs */}
                <div className="flex p-1 bg-slate-800 rounded-lg mb-4">
                  <button
                    onClick={() => setManualMode('general')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded transition ${manualMode === 'general' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    一般輸入
                  </button>
                  <button
                    onClick={() => setManualMode('formula')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded transition ${manualMode === 'formula' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    公式計算
                  </button>
                </div>

                {/* General Mode */}
                {manualMode === 'general' && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Main Inputs */}
                    <div className="space-y-4">
                      
                      {/* Caffeine Amount */}
                      <div>
                        <label className="text-xs text-slate-400 uppercase font-bold tracking-wider block mb-2 ml-1">
                          咖啡因含量 (mg)
                        </label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={manualAmount}
                            onChange={(e) => setManualAmount(e.target.value)}
                            placeholder="0"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-white focus:outline-none focus:border-indigo-500 text-xl font-bold"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">mg</span>
                        </div>
                      </div>

                      {/* Volume Input (Manual only) */}
                      <div>
                        <label className="text-xs text-slate-400 uppercase font-bold tracking-wider block mb-2 ml-1">
                          飲用量 (ml)
                        </label>
                        <div className="relative mb-2">
                          <input 
                            type="number" 
                            value={volumeMl}
                            onChange={(e) => setVolumeMl(e.target.value)}
                            placeholder="輸入容量 (例如：350)"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-3 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">ml</span>
                        </div>
                      </div>

                      {/* Name & Time */}
                      <div className="grid gap-4">
                          <div>
                              <label className="text-xs text-slate-400 font-bold uppercase block mb-1.5 ml-1">品項名稱</label>
                              <input 
                                  type="text"
                                  value={manualName}
                                  onChange={(e) => setManualName(e.target.value)}
                                  placeholder="例如：自製手沖"
                                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition-colors"
                              />
                          </div>
                          
                          <div>
                              <label className="text-xs text-slate-400 font-bold uppercase block mb-1.5 ml-1">飲用時間</label>
                              <input 
                                  type="datetime-local"
                                  value={drinkTime}
                                  onChange={(e) => setDrinkTime(e.target.value)}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none appearance-none transition-colors"
                              />
                          </div>
                      </div>

                      <button 
                        disabled={!manualAmount}
                        onClick={handleManualSubmit}
                        className="w-full bg-indigo-600 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20"
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
                    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                        <div className="text-center text-slate-400 text-[10px] mb-4 font-mono tracking-widest opacity-80">
                          ( 咖啡因濃度 % × 咖啡粉重 g ) × 1000 = 總量 mg
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 text-xl font-bold text-white flex-wrap">
                          <span className="text-slate-500">(</span>
                          <div className="relative w-16 sm:w-20">
                            <input
                              type="number"
                              value={caffeinePercentage}
                              onChange={(e) => setCaffeinePercentage(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-center focus:border-indigo-500 outline-none text-indigo-400"
                              placeholder="1.2"
                            />
                            <span className="text-[10px] absolute -bottom-5 left-0 w-full text-center text-slate-500">濃度 %</span>
                          </div>
                          <span className="text-slate-500">×</span>
                          <div className="relative w-16 sm:w-20">
                            <input
                              type="number"
                              value={beanWeight}
                              onChange={(e) => setBeanWeight(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-center focus:border-indigo-500 outline-none text-white"
                              placeholder="0"
                            />
                            <span className="text-[10px] absolute -bottom-5 left-0 w-full text-center text-slate-500">粉重 g</span>
                          </div>
                          <span className="text-slate-500">)</span>
                          <span className="text-slate-500 text-sm sm:text-lg">× 1000 = </span>
                          <div className="relative min-w-[3ch]">
                            <span className="text-indigo-400 text-2xl">
                              {beanWeight && caffeinePercentage ? Math.round(Number(beanWeight) * Number(caffeinePercentage) * 10) : 0}
                            </span>
                            <span className="text-[10px] absolute -bottom-1.5 left-full ml-1 text-slate-500">mg</span>
                          </div>
                        </div>
                    </div>

                    {/* Extra Inputs */}
                    <div className="grid gap-4">
                        <div>
                            <label className="text-xs text-slate-400 font-bold uppercase block mb-1.5 ml-1">品項名稱</label>
                            <input 
                                type="text"
                                value={manualName}
                                onChange={(e) => setManualName(e.target.value)}
                                placeholder="例如：手沖耶加雪菲"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition-colors"
                            />
                        </div>
                        
                        <div>
                            <label className="text-xs text-slate-400 font-bold uppercase block mb-1.5 ml-1">飲用時間</label>
                            <input 
                                type="datetime-local"
                                value={drinkTime}
                                onChange={(e) => setDrinkTime(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none appearance-none transition-colors"
                            />
                        </div>
                    </div>
                    
                    <button 
                      disabled={!beanWeight}
                      onClick={handleFormulaSubmit}
                      className="w-full bg-indigo-600 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20 mt-2"
                    >
                      確認新增
                    </button>
                  </div>
                )}

              </div>
           )}

           {/* AI Input View */}
           {addTab === 'ai' && (
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
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setScanResult(null)}
                          className="flex-1 py-3 text-sm text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
                        >
                          重試
                        </button>
                        <button 
                          onClick={() => onAddLog(scanResult.drinkName, scanResult.estimatedMg, 'ai')}
                          className="flex-1 py-3 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition"
                        >
                          確認新增
                        </button>
                      </div>
                  </div>
                )}
              </div>
           )}
        </div>
      )}
    </div>
  );
};

export default AddLogView;