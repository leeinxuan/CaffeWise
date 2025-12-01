import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { 
  Coffee, 
  Camera, 
  Droplet, 
  Trash2, 
  Zap,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Database,
  Keyboard,
  Sparkles,
  Calendar,
  Clock,
  TrendingUp,
  PieChart as PieChartIcon,
  Award
} from 'lucide-react';

import { CaffeineLog, UserSettings, TabView, BrandItem } from './types';
import { BRAND_DATABASE, DEFAULT_SETTINGS } from './constants';
import { calculateCurrentLevel, predictClearanceTime, formatTime } from './utils/caffeineMath';
import { analyzeImageForCaffeine } from './services/geminiService';

import Navigation from './components/Navigation';
import MetabolicGauge from './components/MetabolicGauge';
import SleepForecast from './components/SleepForecast';
import BreathingExercise from './components/BreathingExercise';

// --- Components ---

const StatsView: React.FC<{ logs: CaffeineLog[], dailyLimitMg: number }> = ({ logs, dailyLimitMg }) => {
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
                      // Show fewer ticks for month view
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

// --- Main App Component ---

const App: React.FC = () => {
  // --- State ---
  const [logs, setLogs] = useState<CaffeineLog[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [currentTab, setCurrentTab] = useState<TabView>(TabView.DASHBOARD);
  const [currentLevel, setCurrentLevel] = useState(0);
  
  // Add Drink State
  const [addTab, setAddTab] = useState<'menu' | 'brand' | 'manual' | 'ai'>('menu');
  const [selectedBrand, setSelectedBrand] = useState<BrandItem | null>(null);
  const [selectedDrink, setSelectedDrink] = useState<BrandItem['items'][0] | null>(null);
  const [manualAmount, setManualAmount] = useState('');
  
  // Advanced Manual Input State
  const [manualMode, setManualMode] = useState<'general' | 'formula'>('general');
  
  // Formula Mode State
  const [caffeinePercentage, setCaffeinePercentage] = useState('1.2');
  const [beanWeight, setBeanWeight] = useState('');
  
  // Common Manual Inputs
  const [manualName, setManualName] = useState('');
  const [drinkTime, setDrinkTime] = useState(() => {
    const now = new Date();
    // Adjust to local time ISO string for datetime-local input
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });

  // Volume Mode State (Reference only)
  const [volumeMl, setVolumeMl] = useState('');

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  // --- Effects ---

  // Initial Load (Simulated persistence)
  useEffect(() => {
    const savedLogs = localStorage.getItem('caffe_logs');
    const savedSettings = localStorage.getItem('caffe_settings');
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  // Save on Change
  useEffect(() => {
    localStorage.setItem('caffe_logs', JSON.stringify(logs));
    localStorage.setItem('caffe_settings', JSON.stringify(settings));
  }, [logs, settings]);

  // Update Metabolic Level Timer
  useEffect(() => {
    const update = () => {
      const level = calculateCurrentLevel(logs, settings.halfLifeHours);
      setCurrentLevel(level);
    };
    update();
    const interval = setInterval(update, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [logs, settings.halfLifeHours]);

  // Reset addTab to menu when switching main tabs
  useEffect(() => {
    if (currentTab === TabView.ADD) {
        setAddTab('menu');
        // Reset internal states
        setSelectedBrand(null);
        setSelectedDrink(null);
        setScanResult(null);
    }
  }, [currentTab]);

  // --- Handlers ---

  const addLog = (name: string, amountMg: number, source: CaffeineLog['source'], customTimestamp?: number) => {
    const newLog: CaffeineLog = {
      id: Date.now().toString(),
      name,
      amountMg,
      timestamp: customTimestamp || Date.now(),
      source
    };
    setLogs(prev => [newLog, ...prev]);
    setCurrentTab(TabView.DASHBOARD);
    
    // Reset Add Form States
    setScanResult(null);
    setManualAmount('');
    setBeanWeight('');
    setVolumeMl('');
    setManualName('');
    setSelectedBrand(null);
    setSelectedDrink(null);
    
    // Reset time to now
    const now = new Date();
    setDrinkTime(new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
  };

  const removeLog = (id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1]; // Remove data URL prefix
      
      const result = await analyzeImageForCaffeine(base64Data, file.type);
      setScanResult(result);
      setIsScanning(false);
    };
    reader.readAsDataURL(file);
  };

  // --- Derived Data ---
  const sleepClearTime = predictClearanceTime(currentLevel, settings.sleepThresholdMg, settings.halfLifeHours);
  
  let status: 'safe' | 'warning' | 'danger' = 'safe';
  if (currentLevel > 200 || currentLevel > settings.dailyLimitMg) status = 'danger';
  else if (currentLevel > 100) status = 'warning';

  // --- Sub-Views ---

  const renderDashboard = () => (
    <div className="space-y-6 pb-24 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            CaffeWise
          </h1>
          <p className="text-xs text-slate-400">代謝監測中</p>
        </div>
        <button onClick={() => setCurrentTab(TabView.SOS)} className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/20 hover:bg-red-500/20 transition">
          SOS 救援
        </button>
      </header>

      {/* Main Gauge */}
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 shadow-xl backdrop-blur-sm">
        <MetabolicGauge currentMg={currentLevel} limitMg={settings.dailyLimitMg} status={status} />
        
        <div className="flex justify-between mt-4 text-center divide-x divide-slate-700">
          <div className="flex-1 px-2">
             <div className="text-xs text-slate-400 mb-1">目前狀態</div>
             <div className={`font-bold ${status === 'safe' ? 'text-green-400' : status === 'warning' ? 'text-orange-400' : 'text-red-400'}`}>
               {status === 'safe' ? '清醒/安全' : status === 'warning' ? '亢奮/警戒' : '危險/焦慮'}
             </div>
          </div>
          <div className="flex-1 px-2">
             <div className="text-xs text-slate-400 mb-1">預計代謝完畢</div>
             <div className="font-bold text-indigo-400">
               {sleepClearTime ? formatTime(sleepClearTime) : '現在'}
             </div>
          </div>
        </div>
      </div>

      {/* Sleep Forecast */}
      <SleepForecast clearTime={sleepClearTime} bedtime={settings.bedtime} />

      {/* Recent Activity */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">近期攝取紀錄</h3>
        <div className="space-y-3">
          {logs.length === 0 && <p className="text-slate-500 text-sm italic">今日尚無紀錄。</p>}
          {logs.slice(0, 5).map(log => (
            <div key={log.id} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="bg-slate-700 p-2 rounded-full">
                  <Coffee size={16} className="text-amber-400" />
                </div>
                <div>
                  <div className="font-medium text-slate-200">{log.name}</div>
                  <div className="text-xs text-slate-500">
                    {new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} • 
                    {log.source === 'brand' ? '品牌資料庫' : log.source === 'manual' ? '手動輸入' : 'AI 辨識'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-300">{log.amountMg}mg</span>
                <button onClick={() => removeLog(log.id)} className="text-slate-600 hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAdd = () => (
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
                  // Level 3: Select Size (Action)
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
                      
                      <div className="p-4 grid gap-3">
                          {selectedDrink.sizes.map(size => (
                            <button
                              key={size.label}
                              onClick={() => addLog(`${selectedBrand.name} ${selectedDrink.name}`, size.mg, 'brand')}
                              className="flex items-center justify-between p-4 bg-slate-700/50 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20 rounded-xl border border-slate-600 hover:border-indigo-400 transition-all duration-300 group"
                            >
                              <span className="font-medium text-slate-200 group-hover:text-white">{size.label}</span>
                              <span className="font-bold text-indigo-300 group-hover:text-white text-lg">{size.mg} <span className="text-sm font-normal opacity-70">mg</span></span>
                            </button>
                          ))}
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
                        onClick={() => {
                          const timestamp = new Date(drinkTime).getTime();
                          const name = manualName || (volumeMl ? `飲品 (${volumeMl}ml)` : '手動紀錄');
                          addLog(name, Number(manualAmount), 'manual', timestamp);
                        }}
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
                      onClick={() => {
                          const mg = Math.round(Number(beanWeight) * Number(caffeinePercentage) * 10);
                          const timestamp = new Date(drinkTime).getTime();
                          const name = manualName || '手沖咖啡';
                          addLog(name, mg, 'manual', timestamp);
                      }}
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
                          onClick={() => addLog(scanResult.drinkName, scanResult.estimatedMg, 'ai')}
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

  const renderWiki = () => (
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

  const renderSettings = () => {
    // Generate time options for dropdown (00:00 to 23:30)
    const timeOptions = [];
    for (let i = 0; i < 24; i++) {
        const hour = i.toString().padStart(2, '0');
        timeOptions.push(`${hour}:00`);
        timeOptions.push(`${hour}:30`);
    }

    return (
    <div className="pb-24 space-y-6">
      <h2 className="text-xl font-bold text-white">個人設定</h2>
      
      <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 divide-y divide-slate-700">
         <div className="p-4 flex justify-between items-center">
            <span className="text-slate-300">每日上限 (mg)</span>
            <input 
              type="number" 
              value={settings.dailyLimitMg}
              onChange={(e) => setSettings({...settings, dailyLimitMg: Number(e.target.value)})}
              className="bg-slate-900 text-white rounded p-1 w-20 text-right"
            />
         </div>
         <div className="p-4 flex justify-between items-center">
            <span className="text-slate-300">目標就寢時間</span>
            <select
              value={settings.bedtime}
              onChange={(e) => setSettings({...settings, bedtime: e.target.value})}
              className="bg-slate-900 text-white rounded p-2 text-right border border-slate-700 outline-none focus:border-indigo-500"
            >
               {timeOptions.map(t => (
                   <option key={t} value={t}>{t}</option>
               ))}
            </select>
         </div>
         <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300">代謝速度設定</span>
              <span className="text-indigo-400 text-sm font-bold">{settings.halfLifeHours} 小時半衰期</span>
            </div>
            <input 
              type="range" 
              min="3" 
              max="10" 
              step="0.5"
              value={settings.halfLifeHours}
              onChange={(e) => setSettings({...settings, halfLifeHours: Number(e.target.value)})}
              className="w-full accent-indigo-500 h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
               <span>快代謝</span>
               <span>一般</span>
               <span>慢代謝</span>
            </div>
         </div>
      </div>

      <button 
        onClick={() => { localStorage.clear(); window.location.reload(); }}
        className="w-full py-3 text-red-400 border border-red-500/20 bg-red-500/10 rounded-xl text-sm font-bold hover:bg-red-500/20"
      >
        重置所有資料
      </button>
    </div>
    );
  };

  // --- Main Render ---

  if (currentTab === TabView.SOS) {
    return <BreathingExercise onClose={() => setCurrentTab(TabView.DASHBOARD)} />;
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-900 text-slate-50 p-6 selection:bg-indigo-500/30">
        <main className="max-w-md mx-auto relative">
          
          {currentTab === TabView.DASHBOARD && renderDashboard()}
          {currentTab === TabView.ADD && renderAdd()}
          {currentTab === TabView.STATS && <StatsView logs={logs} dailyLimitMg={settings.dailyLimitMg} />}
          {currentTab === TabView.WIKI && renderWiki()}
          {currentTab === TabView.SETTINGS && renderSettings()}

        </main>
        <Navigation currentTab={currentTab} setTab={setCurrentTab} />
      </div>
    </HashRouter>
  );
};

export default App;