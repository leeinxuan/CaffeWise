
import React from 'react';
import { TabView } from '../types';
import { LayoutDashboard, PlusCircle, BarChart2, BookOpen, CalendarDays } from 'lucide-react';

interface NavigationProps {
  currentTab: TabView;
  setTab: (tab: TabView) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentTab, setTab }) => {
  const navItems = [
    { tab: TabView.DASHBOARD, icon: LayoutDashboard, label: '儀表板' },
    { tab: TabView.CALENDAR, icon: CalendarDays, label: '咖啡紀錄' },
    { tab: TabView.ADD, icon: PlusCircle, label: '紀錄', special: true },
    { tab: TabView.STATS, icon: BarChart2, label: '統計' },
    { tab: TabView.WIKI, icon: BookOpen, label: '百科' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 pb-safe z-50">
      <div className="flex justify-around items-center px-2 py-3">
        {navItems.map((item) => {
          const isActive = currentTab === item.tab;
          const Icon = item.icon;
          
          if (item.special) {
            return (
              <button
                key={item.tab}
                onClick={() => setTab(item.tab)}
                className="relative -top-5 bg-gradient-to-tr from-indigo-600 to-purple-600 p-4 rounded-full shadow-lg shadow-indigo-500/30 border-4 border-slate-900 transform transition active:scale-95"
              >
                <Icon size={28} className="text-white" />
              </button>
            );
          }

          return (
            <button
              key={item.tab}
              onClick={() => setTab(item.tab)}
              className={`flex flex-col items-center gap-1 min-w-[60px] transition-colors ${
                isActive ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;
