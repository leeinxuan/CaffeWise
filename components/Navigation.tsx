import React from 'react';
import { TabView } from '../types';
import { Bean, Plus, BarChart2, BookOpen, CalendarDays } from 'lucide-react';

interface NavigationProps {
  currentTab: TabView;
  setTab: (tab: TabView) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentTab, setTab }) => {
  const navItems = [
    { tab: TabView.DASHBOARD, icon: Bean, label: '代謝狀態' },
    { tab: TabView.CALENDAR, icon: CalendarDays, label: '咖啡紀錄' },
    { tab: TabView.ADD, icon: Plus, label: '紀錄', special: true },
    { tab: TabView.STATS, icon: BarChart2, label: '統計' },
    { tab: TabView.WIKI, icon: BookOpen, label: '百科' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-stone-200 pb-safe z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
      <div className="flex justify-around items-center px-2 py-3">
        {navItems.map((item) => {
          const isActive = currentTab === item.tab;
          const Icon = item.icon;
          
          if (item.special) {
            return (
              <button
                key={item.tab}
                onClick={() => setTab(item.tab)}
                className="relative -top-6 bg-[#6F4E37] w-14 h-14 rounded-full shadow-lg shadow-[#6F4E37]/40 transform transition active:scale-95 flex items-center justify-center overflow-hidden"
              >
                {/* Subtle sheen effect */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent"></div>
                <Icon size={28} className="text-white relative z-10" strokeWidth={3} />
              </button>
            );
          }

          return (
            <button
              key={item.tab}
              onClick={() => setTab(item.tab)}
              className={`flex flex-col items-center gap-1 min-w-[60px] transition-colors ${
                isActive ? 'text-[#6F4E37]' : 'text-stone-400 hover:text-stone-600'
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