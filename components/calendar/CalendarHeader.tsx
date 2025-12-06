
import React from 'react';
import { CalendarDays, ChefHat, Bean } from 'lucide-react';

interface CalendarHeaderProps {
  beanCount: number;
  onOpenRecipeBook: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ beanCount, onOpenRecipeBook }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <CalendarDays className="text-[#8D6E63]" size={24} />
        <h2 className="text-xl font-bold text-[#6F4E37]">咖啡紀錄</h2>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={onOpenRecipeBook}
          className="bg-white border border-stone-200 text-[#6F4E37] p-2 rounded-full shadow-sm active:scale-95 transition"
        >
          <ChefHat size={20} />
        </button>
        <div className="bg-[#6F4E37] text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md shadow-[#6F4E37]/20">
          <Bean size={14} className="text-amber-300 fill-current" />
          <span className="font-bold text-sm">{beanCount}</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
