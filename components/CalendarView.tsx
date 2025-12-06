
import React, { useState } from 'react';
import { CaffeineLog } from '../types';

import CalendarHeader from './calendar/CalendarHeader';
import CoffeeGarden from './calendar/CoffeeGarden';
import CalendarGrid from './calendar/CalendarGrid';
import DayLogList from './calendar/DayLogList';
import RecipeBookModal from './calendar/RecipeBookModal';

interface CalendarViewProps {
  logs: CaffeineLog[];
  onRemoveLog: (id: string) => void;
  beanCount: number;
  waterLevel: number; // 0-3
  onHarvest: () => void;
  unlockedRecipes: number[];
  onUnlockRecipe: (id: number, cost: number) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  logs, onRemoveLog, beanCount, waterLevel, onHarvest, unlockedRecipes, onUnlockRecipe 
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isRecipeOpen, setIsRecipeOpen] = useState(false);

  return (
    <div className="pb-24 space-y-6 animate-fade-in">
      <CalendarHeader 
        beanCount={beanCount} 
        onOpenRecipeBook={() => setIsRecipeOpen(true)} 
      />

      <CoffeeGarden 
        waterLevel={waterLevel} 
        onHarvest={onHarvest} 
      />

      <CalendarGrid 
        logs={logs} 
        selectedDate={selectedDate} 
        onSelectDate={setSelectedDate} 
      />

      <DayLogList 
        logs={logs} 
        selectedDate={selectedDate} 
        onRemoveLog={onRemoveLog} 
      />

      <RecipeBookModal 
        isOpen={isRecipeOpen} 
        onClose={() => setIsRecipeOpen(false)}
        beanCount={beanCount}
        unlockedRecipes={unlockedRecipes}
        onUnlockRecipe={onUnlockRecipe}
      />
    </div>
  );
};

export default CalendarView;
