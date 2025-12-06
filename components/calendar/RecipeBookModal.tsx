
import React from 'react';
import { createPortal } from 'react-dom';
import { ChefHat, X, Check, Lock, Unlock } from 'lucide-react';

interface RecipeBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  beanCount: number;
  unlockedRecipes: number[];
  onUnlockRecipe: (id: number, cost: number) => void;
}

// Recipes Configuration
const RECIPES = [
  { 
    id: 1, 
    name: "經典提拉米蘇", 
    cost: 3, 
    desc: "義大利國寶級甜點，手指餅乾吸飽濃縮咖啡與酒香，馬斯卡彭起司帶來濃郁口感。", 
    image: "/img/tiramisu.png",
    fallbackImage: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=800&auto=format&fit=crop"
  },
  { 
    id: 2, 
    name: "焦糖阿法奇朵", 
    cost: 6, 
    desc: "熱騰騰的 Espresso 澆淋在香草冰淇淋上，冰火交融的極致享受。", 
    image: "https://images.unsplash.com/photo-1594488518868-245c479383b4?q=80&w=800&auto=format&fit=crop"
  },
  { 
    id: 3, 
    name: "日式草莓鮮奶油蛋糕", 
    cost: 10, 
    desc: "蓬鬆的海綿蛋糕夾著新鮮草莓與輕盈鮮奶油，酸甜適中，最適合搭配淺焙咖啡。", 
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=800&auto=format&fit=crop"
  },
  { 
    id: 4, 
    name: "濃郁布朗尼", 
    cost: 15, 
    desc: "外層酥脆、內心濕潤的巧克力布朗尼，加入核桃增加口感層次。", 
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476d?q=80&w=800&auto=format&fit=crop"
  },
];

const RecipeBookModal: React.FC<RecipeBookModalProps> = ({ 
  isOpen, onClose, beanCount, unlockedRecipes, onUnlockRecipe 
}) => {
  if (!isOpen) return null;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, fallback?: string) => {
    if (fallback) {
      e.currentTarget.src = fallback;
    } else {
      // Generic fallback if no specific fallback provided
      e.currentTarget.src = "https://images.unsplash.com/photo-1515442261605-65987783cb6a?q=80&w=800&auto=format&fit=crop";
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
       <div className="bg-[#FFFBF7] w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
          {/* Modal Header */}
          <div className="bg-[#6F4E37] p-5 text-white flex justify-between items-center">
             <div className="flex items-center gap-2">
                <ChefHat size={20} />
                <h3 className="font-bold text-lg">甜點食譜書</h3>
             </div>
             <button onClick={onClose} className="bg-white/10 p-1.5 rounded-full hover:bg-white/20 transition">
                <X size={20} />
             </button>
          </div>
          
          <div className="bg-amber-100/50 p-3 text-center border-b border-amber-100 flex justify-between items-center px-6">
             <span className="text-xs text-amber-800 font-medium">目前擁有</span>
             <span className="text-lg font-bold text-[#6F4E37] flex items-center gap-1">
               {beanCount} <span className="text-xs font-normal text-stone-500">顆咖啡豆</span>
             </span>
          </div>

          {/* Recipe List */}
          <div className="overflow-y-auto p-4 space-y-4">
             {RECIPES.map(recipe => {
                const isUnlocked = unlockedRecipes.includes(recipe.id);
                const canUnlock = beanCount >= recipe.cost;
                
                return (
                   <div key={recipe.id} className={`rounded-2xl border overflow-hidden transition-all ${isUnlocked ? 'bg-white border-stone-200' : 'bg-stone-50 border-stone-100'}`}>
                      
                      {/* Image Area */}
                      <div className="h-32 w-full relative overflow-hidden">
                         {isUnlocked ? (
                           <>
                             <img 
                               src={recipe.image} 
                               alt={recipe.name}
                               onError={(e) => handleImageError(e, (recipe as any).fallbackImage)}
                               className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
                             />
                             <div className="absolute top-2 right-2 bg-green-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1 backdrop-blur-sm">
                               <Check size={10} /> 已解鎖
                             </div>
                           </>
                         ) : (
                           <div className="w-full h-full bg-stone-300 flex flex-col items-center justify-center text-stone-500 relative">
                               <div className="bg-white/50 p-3 rounded-full mb-2">
                                  <Lock size={24} />
                               </div>
                               <span className="text-xs font-bold text-stone-500 bg-white/50 px-2 py-1 rounded">神秘甜點</span>
                           </div>
                         )}
                      </div>

                      {/* Content Area */}
                      <div className="p-4">
                         <div className="flex justify-between items-start mb-2">
                            <h4 className={`font-bold ${isUnlocked ? 'text-stone-800' : 'text-stone-500'}`}>{recipe.name}</h4>
                            {!isUnlocked && (
                                <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                  需要 {recipe.cost} 顆豆子
                                </span>
                            )}
                         </div>
                         
                         <p className="text-xs text-stone-500 leading-relaxed mb-4 min-h-[2.5em]">
                            {isUnlocked ? recipe.desc : "??? 繼續收集咖啡豆以解鎖此神秘食譜內容"}
                         </p>

                         {/* Unlock Action */}
                         {!isUnlocked && (
                            <button
                              onClick={() => onUnlockRecipe(recipe.id, recipe.cost)}
                              disabled={!canUnlock}
                              className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm
                                ${canUnlock 
                                  ? 'bg-[#6F4E37] text-white hover:bg-[#5D4037] shadow-lg shadow-[#6F4E37]/20 active:scale-[0.98]' 
                                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'}
                              `}
                            >
                              {canUnlock ? (
                                <>
                                  <Unlock size={16} />
                                  解鎖食譜 (花費 {recipe.cost} 豆)
                                </>
                              ) : (
                                <>
                                  <Lock size={16} />
                                  咖啡豆不足
                                </>
                              )}
                            </button>
                         )}
                      </div>
                   </div>
                );
             })}
          </div>
       </div>
    </div>,
    document.body
  );
};

export default RecipeBookModal;
