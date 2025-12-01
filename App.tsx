
import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';

import { CaffeineLog, UserSettings, TabView } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { calculateCurrentLevel, predictClearanceTime } from './utils/caffeineMath';

// Components
import Navigation from './components/Navigation';
import BreathingExercise from './components/BreathingExercise';
import DashboardView from './components/DashboardView';
import AddLogView from './components/AddLogView';
import StatsView from './components/StatsView';
import WikiView from './components/WikiView';
import SettingsView from './components/SettingsView';

// --- Main App Component ---

const App: React.FC = () => {
  // --- State ---
  const [logs, setLogs] = useState<CaffeineLog[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [currentTab, setCurrentTab] = useState<TabView>(TabView.DASHBOARD);
  const [currentLevel, setCurrentLevel] = useState(0);

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

  if (currentTab === TabView.SOS) {
    return <BreathingExercise onClose={() => setCurrentTab(TabView.DASHBOARD)} />;
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-900 text-slate-50 p-6 selection:bg-indigo-500/30">
        <main className="max-w-md mx-auto relative">
          
          {currentTab === TabView.DASHBOARD && (
            <DashboardView 
              currentLevel={currentLevel}
              settings={settings}
              logs={logs}
              sleepClearTime={sleepClearTime}
              status={status}
              onRemoveLog={removeLog}
              onSOS={() => setCurrentTab(TabView.SOS)}
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
