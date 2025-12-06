
import React from 'react';

interface CoffeeGardenProps {
  waterLevel: number; // 0-3
  onHarvest: () => void;
}

const CoffeeGarden: React.FC<CoffeeGardenProps> = ({ waterLevel, onHarvest }) => {
  // --- Garden Visual Helpers (3D CSS Style) ---
  const renderPlant = () => {
    // Shared Soil Style (3D Mound)
    const Soil = () => (
      <div className="w-20 h-8 mx-auto relative z-10">
         {/* Main Mound */}
         <div className="absolute bottom-0 w-full h-full bg-gradient-to-b from-[#8D6E63] to-[#5D4037] rounded-t-full shadow-lg"></div>
         {/* Highlight on soil */}
         <div className="absolute top-1 left-4 w-6 h-2 bg-white/10 rounded-full blur-[2px]"></div>
      </div>
    );

    if (waterLevel === 0) {
      return (
        <div className="relative mt-8 animate-fade-in flex flex-col items-center justify-end h-32">
          {/* Seed buried */}
          <div className="w-2 h-2 bg-lime-200 rounded-full absolute bottom-7 left-1/2 -translate-x-1/2 z-0 animate-pulse"></div>
          <Soil />
          <p className="text-xs text-stone-400 mt-2 text-center font-medium">播種期</p>
        </div>
      );
    } else if (waterLevel === 1) {
      return (
        <div className="relative mt-4 animate-fade-in flex flex-col items-center justify-end h-32">
           {/* Plant Container */}
           <div className="relative z-0 mb-[-5px] animate-[wave_3s_ease-in-out_infinite] origin-bottom">
              {/* Stem */}
              <div className="w-2 h-10 bg-gradient-to-r from-lime-300 to-lime-500 mx-auto rounded-full"></div>
              {/* Tiny Leaves */}
              <div className="absolute top-0 left-1/2 -translate-x-full w-3 h-3 bg-gradient-to-br from-lime-300 to-green-500 rounded-tl-full rounded-br-full shadow-sm"></div>
              <div className="absolute top-1 left-1/2 w-2 h-2 bg-gradient-to-bl from-lime-300 to-green-500 rounded-tr-full rounded-bl-full shadow-sm"></div>
           </div>
           <Soil />
           <p className="text-xs text-stone-400 mt-2 text-center font-medium">發芽中 (1/3)</p>
        </div>
      );
    } else if (waterLevel === 2) {
      return (
        <div className="relative mt-2 animate-fade-in flex flex-col items-center justify-end h-32">
           {/* Plant Container */}
           <div className="relative z-0 mb-[-5px] animate-[wave_4s_ease-in-out_infinite] origin-bottom">
               {/* Stem */}
               <div className="w-2.5 h-16 bg-gradient-to-r from-lime-300 to-lime-600 mx-auto rounded-full"></div>
               
               {/* 3D Leaves - Left */}
               <div className="absolute top-2 -left-6 w-8 h-8 bg-gradient-to-br from-lime-300 via-green-400 to-green-600 rounded-tr-[2rem] rounded-bl-[2rem] shadow-lg rotate-[-20deg] flex items-center justify-center">
                  <div className="w-full h-full bg-white/10 rounded-tr-[2rem] rounded-bl-[2rem] absolute top-0 left-0 scale-90"></div>
               </div>
               
               {/* 3D Leaves - Right */}
               <div className="absolute top-4 -right-6 w-8 h-8 bg-gradient-to-bl from-lime-300 via-green-400 to-green-600 rounded-tl-[2rem] rounded-br-[2rem] shadow-lg rotate-[20deg] flex items-center justify-center">
                   <div className="w-full h-full bg-white/10 rounded-tl-[2rem] rounded-br-[2rem] absolute top-0 left-0 scale-90"></div>
               </div>
           </div>
           <Soil />
           <p className="text-xs text-stone-400 mt-2 text-center font-medium">成長中 (2/3)</p>
        </div>
      );
    } else {
      return (
        <div className="relative mt-0 animate-fade-in group cursor-pointer flex flex-col items-center justify-end h-32" onClick={onHarvest}>
           {/* Plant Container */}
           <div className="relative z-0 mb-[-5px] animate-[wave_5s_ease-in-out_infinite] origin-bottom">
               {/* Stem */}
               <div className="w-3 h-20 bg-gradient-to-r from-green-400 to-green-700 mx-auto rounded-full"></div>
               
               {/* 3D Leaves - Big */}
               <div className="absolute top-4 -left-8 w-10 h-10 bg-gradient-to-br from-lime-300 via-green-500 to-green-700 rounded-tr-[3rem] rounded-bl-[1rem] shadow-xl rotate-[-25deg]"></div>
               <div className="absolute top-8 -right-8 w-10 h-10 bg-gradient-to-bl from-lime-300 via-green-500 to-green-700 rounded-tl-[3rem] rounded-br-[1rem] shadow-xl rotate-[25deg]"></div>
               
               {/* Coffee Cherries (3D Glossy Spheres) */}
               <div className="absolute top-2 left-1/2 -translate-x-3 w-4 h-4 bg-[radial-gradient(circle_at_30%_30%,_#ff8a80,_#d32f2f)] rounded-full shadow-md animate-bounce"></div>
               <div className="absolute top-6 left-1/2 translate-x-1 w-4 h-4 bg-[radial-gradient(circle_at_30%_30%,_#ff8a80,_#c62828)] rounded-full shadow-md animate-bounce" style={{animationDelay: '0.1s'}}></div>
               <div className="absolute top-10 left-1/2 -translate-x-2 w-4 h-4 bg-[radial-gradient(circle_at_30%_30%,_#ff8a80,_#b71c1c)] rounded-full shadow-md animate-bounce" style={{animationDelay: '0.2s'}}></div>
           </div>
           
           <Soil />
           
           <button className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#6F4E37] text-white text-xs px-4 py-1.5 rounded-full shadow-xl font-bold animate-pulse hover:scale-110 transition z-20 border-2 border-white/20">
             點擊採收！
           </button>
        </div>
      );
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#FFF8F0] to-white rounded-3xl p-5 border border-stone-100 shadow-sm relative overflow-hidden min-h-[220px]">
       <div className="flex justify-between items-start mb-2 relative z-10">
          <h3 className="text-sm font-bold text-[#6F4E37]">我的咖啡樹苗</h3>
          <span className="text-[10px] text-stone-400 bg-white/50 px-2 py-0.5 rounded-full">每喝 1 杯澆水 1 次</span>
       </div>
       
       {/* Background Decoration (Sun) */}
       <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-amber-100 rounded-full blur-xl opacity-60 pointer-events-none"></div>

       <div className="flex items-end justify-center pb-2">
          {renderPlant()}
       </div>

       {/* Progress Bar */}
       <div className="mt-4 flex gap-1 relative z-10">
           {[1, 2, 3].map(step => (
             <div 
               key={step} 
               className={`h-2 flex-1 rounded-full transition-all duration-500 shadow-sm ${
                 waterLevel >= step ? 'bg-blue-400' : 'bg-stone-100'
               }`}
             ></div>
           ))}
       </div>
    </div>
  );
};

export default CoffeeGarden;
