
import React from 'react';
import { Droplet, AlertCircle } from 'lucide-react';

const WikiView: React.FC = () => {
  return (
    <div className="pb-24 space-y-6">
      <h2 className="text-xl font-bold text-white">健康百科</h2>
      
      <div className="space-y-4">
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <h3 className="text-lg font-bold text-indigo-400 mb-2">半衰期 (Half-Life) 概念</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            咖啡因不會立即從體內消失。其半衰期約為 3-7 小時。
            如果您在中午喝了 200mg，下午 5 點時體內可能仍殘留 100mg，晚上 10 點時仍有 50mg。
          </p>
        </div>

        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
           <div className="flex items-center gap-2 mb-2">
              <Droplet size={18} className="text-blue-400" />
              <h3 className="text-lg font-bold text-white">水分補給策略</h3>
           </div>
           <p className="text-sm text-slate-300 leading-relaxed">
             咖啡因有利尿作用。每喝一杯咖啡，建議補充一杯水，以維持代謝效率並減少心悸與焦慮感。
           </p>
        </div>

        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
           <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={18} className="text-orange-400" />
              <h3 className="text-lg font-bold text-white">焦慮與心悸</h3>
           </div>
           <p className="text-sm text-slate-300 leading-relaxed">
             每日超過 400mg 可能過度阻斷腺苷受體，引發腎上腺素釋放。若感到手抖或心跳加速，請立即停止攝取並練習深呼吸。
           </p>
        </div>
      </div>
    </div>
  );
};

export default WikiView;
