import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const BreathingExercise: React.FC<Props> = ({ onClose }) => {
  const [step, setStep] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [stepLabel, setStepLabel] = useState('吸氣');

  useEffect(() => {
    
    const cycle = async () => {
      // Inhale 4s
      setStep('Inhale');
      setStepLabel('吸氣');
      await new Promise(r => setTimeout(r, 4000));
      
      // Hold 7s
      setStep('Hold');
      setStepLabel('憋氣');
      await new Promise(r => setTimeout(r, 7000));
      
      // Exhale 8s
      setStep('Exhale');
      setStepLabel('吐氣');
      await new Promise(r => setTimeout(r, 8000));
      
      cycle();
    };

    cycle();

    return () => {}; 
  }, []);

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col items-center justify-center p-6">
      <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white">
        <X size={32} />
      </button>

      <h2 className="text-2xl font-bold text-indigo-300 mb-8">SOS 緩解：4-7-8 呼吸法</h2>
      
      <div className="relative flex items-center justify-center w-64 h-64">
        {/* Animated Circle */}
        <div 
          className={`absolute w-full h-full rounded-full bg-indigo-500/20 blur-xl transition-all duration-[4000ms] ${
             step === 'Inhale' ? 'scale-110 opacity-60' : 
             step === 'Hold' ? 'scale-100 opacity-80' : 
             'scale-50 opacity-20 duration-[8000ms]'
          }`} 
        />
        <div 
          className={`w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl transition-all duration-[4000ms] ${
             step === 'Inhale' ? 'scale-125' : 
             step === 'Hold' ? 'scale-110' : 
             'scale-90 duration-[8000ms]'
          }`}
        >
          <span className="text-3xl font-bold text-white">{stepLabel}</span>
        </div>
      </div>

      <p className="mt-12 text-slate-400 text-center max-w-xs leading-loose">
        用鼻子輕輕吸氣 4 秒。<br/>
        屏住呼吸 7 秒。<br/>
        用嘴巴用力吐氣 8 秒。
      </p>
    </div>
  );
};

export default BreathingExercise;