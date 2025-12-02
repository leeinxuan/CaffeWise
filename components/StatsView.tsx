import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { TrendingUp, Clock, Award, BarChart2, Sparkles, AlertTriangle, Activity } from 'lucide-react';
import { CaffeineLog } from '../types';
import { SYMPTOMS_LIST } from '../constants';

interface StatsViewProps {
  logs: CaffeineLog[];
  dailyLimitMg: number;
}

const StatsView: React.FC<StatsViewProps> = ({ logs, dailyLimitMg }) => {
  const [statsPeriod, setStatsPeriod] = useState<'week' | 'month'>('week');

  // 1. Determine Date Range
  const now = new Date();
  const days = statsPeriod === 'week' ? 7 : 30;
  const startTime = now.getTime() - days * 24 * 60 * 60 * 1000;
  
  // Filter logs within range
  const periodLogs = useMemo(() => {
      return logs.filter(l => l.timestamp >= startTime);
  }, [logs, startTime]);

  // --- AI Health Insights Logic ---
  const healthInsights = useMemo(() => {
    // Check all logs (not just period) for better data points
    const symptomLogs = logs.filter(l => l.symptoms && l.symptoms.length > 0);
    
    if (symptomLogs.length < 1) return null;

    // A. Dose Correlation: Avg Mg when symptoms occur vs when they don't
    const avgSymptomMg = Math.round(symptomLogs.reduce((acc, l) => acc + l.amountMg, 0) / symptomLogs.length);
    
    const nonSymptomLogs = logs.filter(l => !l.symptoms || l.symptoms.length === 0);
    const avgSafeMg = nonSymptomLogs.length > 0 
      ? Math.round(nonSymptomLogs.reduce((acc, l) => acc + l.amountMg, 0) / nonSymptomLogs.length) 
      : 0;

    // B. Time Correlation: When do symptoms mostly happen?
    const timeCount = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    symptomLogs.forEach(l => {
      const h = new Date(l.timestamp).getHours();
      if (h >= 6 && h < 12) timeCount.morning++;
      else if (h >= 12 && h < 18) timeCount.afternoon++;
      else if (h >= 18 && h <= 23) timeCount.evening++;
      else timeCount.night++;
    });
    
    // Find risky time key
    let riskyTime = 'afternoon';
    let maxCount = -1;
    (Object.keys(timeCount) as Array<keyof typeof timeCount>).forEach(key => {
        if (timeCount[key] > maxCount) {
            maxCount = timeCount[key];
            riskyTime = key;
        }
    });
    
    const timeLabels: Record<string, string> = { morning: '早晨', afternoon: '下午', evening: '晚上', night: '深夜' };

    // C. Top Symptom
    const symMap = new Map<string, number>();
    symptomLogs.flatMap(l => l.symptoms).forEach(s => {
        if (s) symMap.set(s, (symMap.get(s) || 0) + 1);
    });
    const topSymptomId = [...symMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    const topSymptomLabel = SYMPTOMS_LIST.find(s => s.id === topSymptomId)?.label || '不適';

    // D. Generate Recommendation
    let recommendation = "";
    if (avgSymptomMg > avgSafeMg + 30) {
        recommendation = `數據顯示當單次攝取接近 ${avgSymptomMg}mg 時，您容易感到${topSymptomLabel}。建議將單次攝取控制在 ${avgSafeMg}mg 左右以保持舒適。`;
    } else if (riskyTime === 'evening' || riskyTime === 'night') {
        recommendation = `您的${topSymptomLabel}症狀多發生在${timeLabels[riskyTime]}。建議您嘗試在下午 2 點前完成最後一杯咖啡。`;
    } else {
        recommendation = `您最近數次出現${topSymptomLabel}反應，建議每喝一杯咖啡多補充 200ml 水分，幫助代謝。`;
    }

    return {
        avgSymptomMg,
        avgSafeMg,
        riskyTimeLabel: timeLabels[riskyTime],
        topSymptomLabel,
        recommendation,
        symptomCount: symptomLogs.length
    };
  }, [logs]);


  // 2. Data for Trend Chart (Daily Total)
  const trendData = useMemo(() => {
      const map = new Map<string, number>();
      // Initialize all days with 0
      for (let i = days - 1; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const key = d.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' });
          map.set(key, 0);
      }
      
      periodLogs.forEach(l => {
          const key = new Date(l.timestamp).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' });
          if (map.has(key)) {
              map.set(key, (map.get(key) || 0) + l.amountMg);
          }
      });

      return Array.from(map.entries()).map(([date, mg]) => ({ date, mg }));
  }, [periodLogs, days]);

  // 3. Stats Summary
  const totalIntake = periodLogs.reduce((acc, l) => acc + l.amountMg, 0);
  const avgIntake = Math.round(totalIntake / days);
  const maxRecord = periodLogs.reduce((max, l) => l.amountMg > max ? l.amountMg : max, 0);

  // 4. Time Distribution (Habits)
  const timeDistData = useMemo(() => {
      const slots = [
          { name: '早晨 (06-12)', count: 0 },
          { name: '下午 (12-18)', count: 0 },
          { name: '晚上 (18-24)', count: 0 },
          { name: '深夜 (00-06)', count: 0 },
      ];
      
      periodLogs.forEach(l => {
          const h = new Date(l.timestamp).getHours();
          if (h >= 6 && h < 12) slots[0].count += l.amountMg;
          else if (h >= 12 && h < 18) slots[1].count += l.amountMg;
          else if (h >= 18 && h <= 23) slots[2].count += l.amountMg;
          else slots[3].count += l.amountMg;
      });
      
      return slots;
  }, [periodLogs]);

  // 5. Top Drinks
  const topDrinks = useMemo(() => {
      const countMap = new Map<string, number>();
      periodLogs.forEach(l => {
          // Clean up name slightly
          const cleanName = l.name.split(' ')[0];
          countMap.set(cleanName, (countMap.get(cleanName) || 0) + 1);
      });
      return Array.from(countMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);
  }, [periodLogs]);

  return (
    <div className="pb-24 space-y-6 animate-fade-in">
      <header className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart2 className="text-[#8D6E63]" size={24} />
            <h2 className="text-xl font-bold text-[#6F4E37]">統計分析</h2>
          </div>
          <div className="flex bg-stone-200 rounded-lg p-1">
              <button 
                 onClick={() => setStatsPeriod('week')}
                 className={`px-3 py-1 text-xs font-medium rounded-md transition ${statsPeriod === 'week' ? 'bg-white text-[#6F4E37] shadow-sm' : 'text-stone-500'}`}
              >
                  7 天
              </button>
              <button 
                 onClick={() => setStatsPeriod('month')}
                 className={`px-3 py-1 text-xs font-medium rounded-md transition ${statsPeriod === 'month' ? 'bg-white text-[#6F4E37] shadow-sm' : 'text-stone-500'}`}
              >
                  30 天
              </button>
          </div>
      </header>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm text-center">
              <div className="text-stone-400 text-[10px] uppercase mb-1">週期總量</div>
              <div className="text-xl font-bold text-stone-800">{totalIntake}</div>
              <div className="text-[10px] text-stone-400">mg</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm text-center">
              <div className="text-stone-400 text-[10px] uppercase mb-1">平均每日</div>
              <div className="text-xl font-bold text-[#8D6E63]">{avgIntake}</div>
              <div className="text-[10px] text-stone-400">mg</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm text-center">
              <div className="text-stone-400 text-[10px] uppercase mb-1">單次最高</div>
              <div className="text-xl font-bold text-amber-600">{maxRecord}</div>
              <div className="text-[10px] text-stone-400">mg</div>
          </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm">
         <div className="flex items-center gap-2 mb-4">
             <TrendingUp size={16} className="text-[#8D6E63]" />
             <h3 className="text-sm font-bold text-stone-700">攝取趨勢圖 (mg)</h3>
         </div>
         <div className="h-56 w-full">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={trendData}>
               <XAxis 
                  dataKey="date" 
                  stroke="#a8a29e" 
                  fontSize={10} 
                  tickFormatter={(val, index) => {
                      if (statsPeriod === 'month' && index % 5 !== 0) return '';
                      return val;
                  }}
               />
               <YAxis stroke="#a8a29e" fontSize={10} width={30} />
               <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e7e5e4', color: '#44403c', fontSize: '12px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  cursor={{fill: '#f5f5f4'}}
               />
               <Bar dataKey="mg" radius={[4, 4, 0, 0]}>
                  {trendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.mg > dailyLimitMg ? '#ef4444' : '#8D6E63'} />
                  ))}
               </Bar>
             </BarChart>
           </ResponsiveContainer>
         </div>
      </div>

      {/* Habits (Time Distribution) */}
      <div className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
             <Clock size={16} className="text-[#8D6E63]" />
             <h3 className="text-sm font-bold text-stone-700">時段習慣分析</h3>
         </div>
         <div className="h-48 w-full">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={timeDistData} layout="vertical">
               <XAxis type="number" hide />
               <YAxis dataKey="name" type="category" stroke="#78716c" fontSize={11} width={80} />
               <Tooltip 
                  cursor={{fill: '#f5f5f4'}}
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e7e5e4', fontSize: '12px', borderRadius: '8px' }}
               />
               <Bar dataKey="count" fill="#D7CCC8" radius={[0, 4, 4, 0]} barSize={20} />
             </BarChart>
           </ResponsiveContainer>
         </div>
      </div>

      {/* Top Drinks List */}
      <div className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
              <Award size={16} className="text-[#8D6E63]" />
              <h3 className="text-sm font-bold text-stone-700">最常喝的飲品</h3>
          </div>
          <div className="space-y-3">
              {topDrinks.length > 0 ? topDrinks.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-stone-100 text-stone-500 text-xs font-bold">
                              {idx + 1}
                          </span>
                          <span className="text-stone-700 font-medium">{item[0]}</span>
                      </div>
                      <span className="text-stone-400">{item[1]} 次</span>
                  </div>
              )) : (
                  <p className="text-xs text-stone-400 text-center py-4">資料不足</p>
              )}
          </div>
      </div>

      {/* --- AI Health Insights Card --- */}
      <div className="bg-gradient-to-br from-[#6F4E37] to-[#5D4037] p-6 rounded-3xl shadow-lg relative overflow-hidden group text-white">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                <Sparkles size={100} className="text-white" />
            </div>
            
            <div className="flex items-center gap-2 mb-3">
                <Sparkles className="text-amber-200" size={20} />
                <h3 className="text-lg font-bold">AI 健康洞察</h3>
            </div>
            
            {healthInsights ? (
                <>
                    <p className="text-sm text-stone-100 leading-relaxed mb-4 border-l-2 border-amber-300 pl-3">
                        {healthInsights.recommendation}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-black/20 rounded-xl p-3 border border-white/10">
                            <div className="text-[10px] text-stone-300 uppercase mb-1 flex items-center gap-1">
                                <AlertTriangle size={10} /> 發生不適平均值
                            </div>
                            <div className="text-xl font-bold text-red-200">{healthInsights.avgSymptomMg} <span className="text-xs">mg</span></div>
                        </div>
                        <div className="bg-black/20 rounded-xl p-3 border border-white/10">
                            <div className="text-[10px] text-stone-300 uppercase mb-1 flex items-center gap-1">
                                <Activity size={10} /> 安全舒適平均值
                            </div>
                            <div className="text-xl font-bold text-green-200">{healthInsights.avgSafeMg > 0 ? healthInsights.avgSafeMg : '-'} <span className="text-xs">mg</span></div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white/10 p-4 rounded-xl border border-dashed border-white/30 text-center relative z-10">
                    <p className="text-xs text-stone-200 leading-relaxed">
                        目前數據不足。請在紀錄時標記「身體反應」(如手抖、失眠)，AI 將為您分析個人代謝規律與安全閾值。
                    </p>
                </div>
            )}
      </div>
    </div>
  );
};

export default StatsView;