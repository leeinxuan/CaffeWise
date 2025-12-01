
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { TrendingUp, Clock, Award, PieChart as PieChartIcon } from 'lucide-react';
import { CaffeineLog } from '../types';

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

  // 5. Source Preference (Pie)
  const sourceData = useMemo(() => {
      const counts = { brand: 0, manual: 0, ai: 0 };
      periodLogs.forEach(l => counts[l.source]++);
      return [
          { name: '品牌', value: counts.brand, color: '#f59e0b' }, // Amber
          { name: '手動', value: counts.manual, color: '#6366f1' }, // Indigo
          { name: 'AI', value: counts.ai, color: '#a855f7' }, // Purple
      ].filter(d => d.value > 0);
  }, [periodLogs]);

  // 6. Top Drinks
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
          <h2 className="text-xl font-bold text-white">統計分析</h2>
          <div className="flex bg-slate-800 rounded-lg p-1">
              <button 
                 onClick={() => setStatsPeriod('week')}
                 className={`px-3 py-1 text-xs font-medium rounded transition ${statsPeriod === 'week' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'}`}
              >
                  7 天
              </button>
              <button 
                 onClick={() => setStatsPeriod('month')}
                 className={`px-3 py-1 text-xs font-medium rounded transition ${statsPeriod === 'month' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'}`}
              >
                  30 天
              </button>
          </div>
      </header>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center">
              <div className="text-slate-400 text-[10px] uppercase mb-1">週期總量</div>
              <div className="text-xl font-bold text-white">{totalIntake}</div>
              <div className="text-[10px] text-slate-500">mg</div>
          </div>
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center">
              <div className="text-slate-400 text-[10px] uppercase mb-1">平均每日</div>
              <div className="text-xl font-bold text-indigo-400">{avgIntake}</div>
              <div className="text-[10px] text-slate-500">mg</div>
          </div>
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center">
              <div className="text-slate-400 text-[10px] uppercase mb-1">單次最高</div>
              <div className="text-xl font-bold text-amber-400">{maxRecord}</div>
              <div className="text-[10px] text-slate-500">mg</div>
          </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
         <div className="flex items-center gap-2 mb-4">
             <TrendingUp size={16} className="text-indigo-400" />
             <h3 className="text-sm font-medium text-slate-200">攝取趨勢圖 (mg)</h3>
         </div>
         <div className="h-56 w-full">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={trendData}>
               <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickFormatter={(val, index) => {
                      if (statsPeriod === 'month' && index % 5 !== 0) return '';
                      return val;
                  }}
               />
               <YAxis stroke="#64748b" fontSize={10} width={30} />
               <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', fontSize: '12px' }} 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
               />
               <Bar dataKey="mg" radius={[4, 4, 0, 0]}>
                  {trendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.mg > dailyLimitMg ? '#ef4444' : '#6366f1'} />
                  ))}
               </Bar>
             </BarChart>
           </ResponsiveContainer>
         </div>
      </div>

      {/* Habits (Time Distribution) */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
             <Clock size={16} className="text-blue-400" />
             <h3 className="text-sm font-medium text-slate-200">時段習慣分析</h3>
         </div>
         <div className="h-48 w-full">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={timeDistData} layout="vertical">
               <XAxis type="number" hide />
               <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={80} />
               <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', fontSize: '12px' }}
               />
               <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
             </BarChart>
           </ResponsiveContainer>
         </div>
      </div>

      {/* Preferences (Row) */}
      <div className="grid grid-cols-1 gap-4">
          
          {/* Top Items */}
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                  <Award size={16} className="text-amber-400" />
                  <h3 className="text-sm font-medium text-slate-200">最常喝的飲品</h3>
              </div>
              <div className="space-y-3">
                  {topDrinks.length > 0 ? topDrinks.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-3">
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-700 text-slate-300 text-xs font-bold">
                                  {idx + 1}
                              </span>
                              <span className="text-slate-300">{item[0]}</span>
                          </div>
                          <span className="text-slate-500">{item[1]} 次</span>
                      </div>
                  )) : (
                      <p className="text-xs text-slate-500 text-center py-4">資料不足</p>
                  )}
              </div>
          </div>

          {/* Source Pie */}
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                  <PieChartIcon size={16} className="text-purple-400" />
                  <h3 className="text-sm font-medium text-slate-200">紀錄來源偏好</h3>
              </div>
              <div className="h-40 flex items-center justify-center">
                  {sourceData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                  data={sourceData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={60}
                                  paddingAngle={5}
                                  dataKey="value"
                              >
                                  {sourceData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                              </Pie>
                              <Legend 
                                  verticalAlign="middle" 
                                  align="right" 
                                  layout="vertical"
                                  iconSize={8}
                                  formatter={(value) => <span className="text-xs text-slate-400 ml-1">{value}</span>}
                              />
                              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', fontSize: '12px' }} />
                          </PieChart>
                      </ResponsiveContainer>
                  ) : (
                      <p className="text-xs text-slate-500">資料不足</p>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default StatsView;
