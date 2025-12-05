import React from 'react';
import { Coffee } from 'lucide-react';

interface MetabolicGaugeProps {
  currentMg: number;
  limitMg: number;
  status: 'safe' | 'warning' | 'danger';
}

const MetabolicGauge: React.FC<MetabolicGaugeProps> = ({ currentMg, limitMg, status }) => {
  // SVG Configuration
  const radius = 96; // 192px width
  const stroke = 15; // Increased stroke width for a thicker frame
  const normalizedRadius = radius - stroke / 2; // Align stroke to the edge
  const circumference = normalizedRadius * 2 * Math.PI;
  
  // Calculate stroke dash offset
  const progressPercent = Math.min(100, (currentMg / limitMg) * 100);
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Liquid Fill Configuration
  const liquidHeightPercent = Math.min(100, Math.max(0, (currentMg / limitMg) * 100));

  // Colors
  let ringColor = '#65a30d'; // Lime 600 (Safe)
  if (status === 'warning') {
    ringColor = '#ea580c'; // Orange 600
  } else if (status === 'danger') {
    ringColor = '#dc2626'; // Red 600
  }

  const liquidColor = '#6F4E37'; // Coffee Brown

  return (
    <div className="relative flex flex-col items-center justify-center py-4">
      
      {/* Container for the Gauge */}
      <div className="relative w-48 h-48 rounded-full shadow-2xl shadow-stone-200 bg-white">
        
        {/* 1. Liquid Fill Animation (Masked by Circle) */}
        <div className="absolute inset-0 rounded-full overflow-hidden z-0 bg-stone-50">
           {/* Liquid Container */}
           <div 
             className="absolute bottom-0 left-0 w-full transition-all duration-1000 ease-in-out z-10"
             style={{ height: `${liquidHeightPercent}%`, backgroundColor: liquidColor }}
           >
              {/* Wave SVG on top of liquid */}
              <div className="absolute -top-3 left-0 w-[200%] h-6 animate-wave">
                  <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full text-[#6F4E37] fill-current opacity-100">
                      <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" transform="scale(1, -1) translate(0, -120)"></path>
                  </svg>
              </div>
              {/* Secondary Lighter Wave */}
              <div className="absolute -top-3 left-0 w-[200%] h-6 animate-wave" style={{ animationDuration: '6s', opacity: 0.5, transform: 'translateX(-20%)' }}>
                  <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full text-[#8D6E63] fill-current">
                      <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" transform="scale(1, -1) translate(0, -120)"></path>
                  </svg>
              </div>
           </div>
        </div>

        {/* 2. Outer Progress Ring SVG */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          <svg
            height={radius * 2}
            width={radius * 2}
            className="rotate-[-90deg] w-full h-full"
            viewBox={`0 0 ${radius * 2} ${radius * 2}`}
          >
            {/* Track Circle - Thicker frame */}
            <circle
              stroke="#e7e5e4"
              strokeWidth={stroke}
              fill="transparent"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Progress Circle */}
            <circle
              stroke={ringColor}
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
        </div>

        {/* 3. Floating Content Badge */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
          <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-2 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm">
             目前殘留量
          </div>
          
          <div className="bg-[#FFF8F0]/95 backdrop-blur-sm text-[#5D4037] px-6 py-2.5 rounded-full shadow-lg shadow-black/5 flex flex-col items-center min-w-[110px] border border-stone-200">
             <span className="text-2xl font-bold tracking-tight leading-none">
               {Math.round(currentMg)} <span className="text-xs font-normal opacity-70">mg</span>
             </span>
          </div>

          <div className="mt-3 text-white drop-shadow-md">
             {/* Icon color logic */}
             <div className={`${liquidHeightPercent > 50 ? 'text-white' : 'text-stone-300'} transition-colors duration-500`}>
                <Coffee size={28} strokeWidth={2.5} style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))' }} />
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MetabolicGauge;