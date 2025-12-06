
import React, { useState } from 'react';
import { Database, Keyboard, Sparkles, ChevronLeft, Heart, Trash2, PlusCircle } from 'lucide-react';
import { CaffeineLog, FavoriteItem } from '../types';
import AddLogBrand from './add-log/AddLogBrand';
import AddLogManual from './add-log/AddLogManual';
import AddLogAI from './add-log/AddLogAI';

interface AddLogViewProps {
  onAddLog: (name: string, amountMg: number, source: CaffeineLog['source'], customTimestamp?: number, symptoms?: string[]) => void;
  favorites: FavoriteItem[];
  onAddFavorite: (name: string, amountMg: number, source: CaffeineLog['source']) => void;
  onRemoveFavorite: (id: string) => void;
}

const AddLogView: React.FC<AddLogViewProps> = ({ onAddLog, favorites, onAddFavorite, onRemoveFavorite }) => {
  // Navigation State
  const [addTab, setAddTab] = useState<'menu' | 'brand' | 'manual' | 'ai'>('menu');

  // Return to menu handler
  const handleBack = () => setAddTab('menu');

  return (
    <div className="pb-24 space-y-6">
      <h2 className="text-xl font-bold text-[#6F4E37]">紀錄咖啡因</h2>
      
      {/* View: Main Menu */}
      {addTab === 'menu' && (
        <>
          <div className="grid gap-4 animate-fade-in">
             <button 
               onClick={() => setAddTab('brand')}
               className="bg-white hover:bg-stone-50 border border-stone-200 hover:border-[#8D6E63] rounded-3xl p-6 text-left transition-all group shadow-sm hover:shadow-md"
             >
                <div className="flex items-center gap-5">
                   <div className="bg-orange-50 p-4 rounded-full text-orange-500 group-hover:scale-110 transition-transform">
                      <Database size={24} />
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-stone-800 mb-1">連鎖品牌</h3>
                      <p className="text-sm text-stone-500">內建星巴克、超商咖啡數據，快速選取免查詢。</p>
                   </div>
                </div>
             </button>

             <button 
               onClick={() => setAddTab('manual')}
               className="bg-white hover:bg-stone-50 border border-stone-200 hover:border-[#8D6E63] rounded-3xl p-6 text-left transition-all group shadow-sm hover:shadow-md"
             >
                <div className="flex items-center gap-5">
                   <div className="bg-blue-50 p-4 rounded-full text-blue-500 group-hover:scale-110 transition-transform">
                      <Keyboard size={24} />
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-stone-800 mb-1">手動輸入</h3>
                      <p className="text-sm text-stone-500">自訂數值，支援手沖計算與一般容量輸入。</p>
                   </div>
                </div>
             </button>

             <button 
               onClick={() => setAddTab('ai')}
               className="bg-white hover:bg-stone-50 border border-stone-200 hover:border-[#8D6E63] rounded-3xl p-6 text-left transition-all group shadow-sm hover:shadow-md"
             >
                <div className="flex items-center gap-5">
                   <div className="bg-purple-50 p-4 rounded-full text-purple-500 group-hover:scale-110 transition-transform">
                      <Sparkles size={24} />
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-stone-800 mb-1">AI 辨識</h3>
                      <p className="text-sm text-stone-500">拍攝菜單或營養標示，由 Gemini AI 自動分析含量。</p>
                   </div>
                </div>
             </button>
          </div>

          {/* Favorites Section */}
          <div className="mt-2 animate-fade-in">
             <div className="flex items-center gap-2 mb-3 pl-1">
                <Heart className="text-[#8D6E63]" size={18} fill="currentColor" />
                <h3 className="text-sm font-bold text-stone-600">常用飲品</h3>
             </div>
             
             {favorites.length === 0 ? (
               <div className="bg-white/50 border border-dashed border-stone-200 rounded-2xl p-6 text-center text-stone-400 text-sm">
                 <p>尚無常用飲品</p>
                 <p className="text-xs mt-1 opacity-70">在新增紀錄時點擊 <Heart size={10} className="inline"/> 即可加入</p>
               </div>
             ) : (
               <div className="space-y-3">
                 {favorites.map(fav => (
                   <div key={fav.id} className="bg-white border border-stone-100 rounded-2xl p-4 shadow-sm flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <button 
                           onClick={() => onAddLog(fav.name, fav.amountMg, fav.source)}
                           className="bg-[#FFF8F0] p-2 rounded-full text-[#8D6E63] hover:scale-110 transition"
                        >
                           <PlusCircle size={20} />
                        </button>
                        <div>
                           <div className="font-bold text-stone-700 text-sm">{fav.name}</div>
                           <div className="text-xs text-stone-400">
                             {fav.amountMg} mg • {fav.source === 'brand' ? '連鎖' : fav.source === 'ai' ? 'AI' : '手動'}
                           </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => onRemoveFavorite(fav.id)}
                        className="text-stone-300 hover:text-red-400 p-2 transition opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </>
      )}

      {/* View: Specific Content */}
      {addTab !== 'menu' && (
        <div className="animate-fade-in">
           {/* Back to Menu Button */}
           <button 
             onClick={handleBack}
             className="flex items-center gap-2 text-stone-500 hover:text-stone-800 mb-6 transition-colors px-1 font-medium"
           >
              <ChevronLeft size={20} />
              <span className="font-medium">返回選擇模式</span>
           </button>

           {addTab === 'brand' && (
             <AddLogBrand 
                onAddLog={onAddLog} 
                onBack={handleBack} 
                onSaveFavorite={onAddFavorite}
             />
           )}

           {addTab === 'manual' && (
             <AddLogManual 
                onAddLog={onAddLog} 
                onBack={handleBack} 
                onSaveFavorite={onAddFavorite}
             />
           )}

           {addTab === 'ai' && (
             <AddLogAI 
                onAddLog={onAddLog} 
                onBack={handleBack} 
                onSaveFavorite={onAddFavorite}
             />
           )}
        </div>
      )}
    </div>
  );
};

export default AddLogView;
