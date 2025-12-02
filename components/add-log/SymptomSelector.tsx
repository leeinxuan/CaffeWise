import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { SYMPTOMS_LIST } from '../../constants';

interface SymptomSelectorProps {
  selectedSymptoms: string[];
  onChange: (symptoms: string[]) => void;
}

const SymptomSelector: React.FC<SymptomSelectorProps> = ({ selectedSymptoms, onChange }) => {
  return (
    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
      <h4 className="text-xs text-[#8D6E63] font-bold uppercase mb-3 flex items-center gap-1">
        <AlertTriangle size={14} className="text-[#8D6E63]" />
        標記身體反應 (選填)
      </h4>
      <div className="flex flex-wrap gap-2">
        {SYMPTOMS_LIST.map(sym => {
          const isSelected = selectedSymptoms.includes(sym.id);
          return (
            <button
              key={sym.id}
              onClick={() => {
                if (isSelected) onChange(selectedSymptoms.filter(id => id !== sym.id));
                else onChange([...selectedSymptoms, sym.id]);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-1 ${
                isSelected 
                  ? 'bg-red-50 text-red-600 border-red-200 shadow-sm' 
                  : 'bg-white border-stone-200 text-stone-500 hover:border-stone-400 hover:bg-stone-50'
              }`}
            >
              <span className="text-base">{sym.icon}</span>
              {sym.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SymptomSelector;