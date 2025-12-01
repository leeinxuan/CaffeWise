
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { SYMPTOMS_LIST } from '../../constants';

interface SymptomSelectorProps {
  selectedSymptoms: string[];
  onChange: (symptoms: string[]) => void;
}

const SymptomSelector: React.FC<SymptomSelectorProps> = ({ selectedSymptoms, onChange }) => {
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-indigo-500/40 shadow-md">
      <h4 className="text-xs text-indigo-300 font-bold uppercase mb-3 flex items-center gap-1">
        <AlertTriangle size={14} className="text-indigo-400" />
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
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center gap-1 ${
                isSelected 
                  ? 'bg-red-500 text-white border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.4)]' 
                  : 'bg-slate-900 border-slate-600 text-slate-300 hover:border-slate-400 hover:bg-slate-800'
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
