import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { AlertTriangle, X, CheckCircle, Info } from 'lucide-react';

import { CaffeineLog, UserSettings, TabView } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { calculateCurrentLevel, predictClearanceTime } from './utils/caffeineMath';

// Components
import Navigation from './components/Navigation';
import DashboardView from './components/DashboardView';
import AddLogView from './components/AddLogView';
import StatsView from './components/StatsView';
import WikiView from './components/WikiView';
import SettingsView from './components/SettingsView';
import CalendarView from './components/CalendarView';

// --- Alert Banner Component ---
interface AlertBannerProps {
  isOpen: boolean;
  type: 'warning' | 'danger';
  message: string;
  onClose: () => void;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ isOpen, type, message, onClose }) => {
  if (!isOpen) return null;

  const isDanger = type === 'danger';

  // Auto-dismiss logic can be handled here or in parent, doing it here for simplicity
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] animate-slide-down">
      <div className={`rounded-2xl p-4 shadow-lg flex items-start gap-3 ${
        isDanger ? 'bg-red-500 text-white shadow-red-200' : 'bg-orange-500 text-white shadow-orange-200'
      }`}>
        <div className="mt-0.5">
           {isDanger ? <AlertTriangle size={20} fill="currentColor" className="text-red-600" stroke="white" /> : <Info size={20} />}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm mb-0.5">
            {isDanger ? '攝取過量警報' : '進入警戒狀態'}
          </h4>
          <p className="text-xs opacity-90 leading-relaxed">
            {message}
          </p>
        </div>
        <button onClick={onClose} className="opacity-70 hover:opacity-100 transition">
          <X size={18} />
        </button>
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

  // Alert State
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    type: 'warning' | 'danger';
    message: string;
  }>({ isOpen: false, type: 'warning', message: '' });

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
      const now = Date.now();
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      // Filter logs to ensure accuracy:
      // 1. Only count logs from today (startOfDay)
      // 2. Only count logs that have already happened (<= now)
      const todaysRelevantLogs = logs.filter(log => 
        log.timestamp >= startOfDay.getTime() && 
        log.timestamp <= now
      );

      const level = calculateCurrentLevel(todaysRelevantLogs, settings.halfLifeHours);
      setCurrentLevel(level);
    };
    update();
    const interval = setInterval(update, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [logs, settings.halfLifeHours]);

  // --- Handlers ---

  const addLog = (name: string, amountMg: number, source: CaffeineLog['source'], customTimestamp?: number, symptoms?: string[]) => {
    const newLog: CaffeineLog = {
      id: Date.now().toString(),
      name,
      amountMg,
      timestamp: customTimestamp || Date.now(),
      source,
      symptoms: symptoms || []
    };

    // Calculate projected level to trigger alerts
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const now = Date.now();
    
    // Recalculate current level freshly to be safe
    const relevantLogs = logs.filter(log => 
      log.timestamp >= startOfDay.getTime() && 
      log.timestamp <= now
    );
    const calculatedCurrent = calculateCurrentLevel(relevantLogs, settings.halfLifeHours);
    
    // Add the new amount (assuming instant absorption for safety warning)
    const projectedLevel = calculatedCurrent + amountMg;
    
    // Logic for triggering alerts
    if (projectedLevel > settings.dailyLimitMg) {
      setAlertState({
        isOpen: true,
        type: 'danger',
        message: `這杯咖啡將使數值達到 ${Math.round(projectedLevel)}mg，已超過每日上限。建議您改喝低咖啡因飲品。`
      });
    } else if (projectedLevel > 200 && calculatedCurrent <= 200) {
       // Only trigger if crossing the threshold
       setAlertState({
        isOpen: true,
        type: 'warning',
        message: `注意！累積攝取將達 ${Math.round(projectedLevel)}mg。若出現手抖或心悸，請立即停止攝取。`
      });
    }

    setLogs(prev => [newLog, ...prev]);
    setCurrentTab(TabView.DASHBOARD);
  };

  const updateLog = (id: string, updates: Partial<CaffeineLog>) => {
    setLogs(prev => prev.map(log => log.id === id ? { ...log, ...updates } : log));
  };

  const removeLog = (id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  // --- Derived Data ---
  const sleepClearTime = predictClearanceTime(currentLevel, settings.sleepThresholdMg, settings.halfLifeHours);
  
  let status: 'safe' | 'warning' | 'danger' = 'safe';
  if (currentLevel > 200 || currentLevel > settings.dailyLimitMg) status = 'danger';
  else if (currentLevel > 100) status = 'warning';

  // --- Main Render ---

  return (
    <HashRouter>
      <div className="min-h-screen bg-[#FFFBF7] text-stone-800 p-6 selection:bg-orange-200">
        <main className="max-w-md mx-auto relative">
          
          {/* Notification Banner */}
          <AlertBanner 
            isOpen={alertState.isOpen}
            type={alertState.type}
            message={alertState.message}
            onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
          />
          
          {currentTab === TabView.DASHBOARD && (
            <DashboardView 
              currentLevel={currentLevel}
              settings={settings}
              logs={logs}
              sleepClearTime={sleepClearTime}
              status={status}
              onRemoveLog={removeLog}
              onUpdateLog={updateLog}
              onOpenSettings={() => setCurrentTab(TabView.SETTINGS)}
            />
          )}

          {currentTab === TabView.CALENDAR && (
            <CalendarView 
              logs={logs}
              onRemoveLog={removeLog}
            />
          )}

          {currentTab === TabView.ADD && (
            <AddLogView onAddLog={addLog} />
          )}

          {currentTab === TabView.STATS && (
            <StatsView logs={logs} dailyLimitMg={settings.dailyLimitMg} />
          )}

          {currentTab === TabView.WIKI && (
            <WikiView />
          )}

          {currentTab === TabView.SETTINGS && (
            <SettingsView settings={settings} setSettings={setSettings} />
          )}

        </main>
        <Navigation currentTab={currentTab} setTab={setCurrentTab} />
      </div>
    </HashRouter>
  );
};

export default App;