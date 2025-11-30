import React from 'react';

interface MetabolicGaugeProps {
  currentMg: number;
  limitMg: number;
  status: 'safe' | 'warning' | 'danger';
}

const MetabolicGauge: React.FC<MetabolicGaugeProps> = ({ currentMg, limitMg, status }) => {
  // SVG Configuration
  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  
  // Calculate stroke dash offset
  // We want to show how much is "filled" relative to a safe max (e.g. 400mg)
  // But logically, "Full" means high caffeine.
  const percentage = Math.min(100, (currentMg / limitMg) * 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let color = '#22c55e'; // Green
  let glowColor = 'rgba(34, 197, 94, 0.5)';
  
  if (status === 'warning') {
    color = '#f97316'; // Orange
    glowColor = 'rgba(249, 115, 22, 0.5)';
  } else if (status === 'danger') {
    color = '#ef4444'; // Red
    glowColor = 'rgba(239, 68, 68, 0.5)';
  }

  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="rotate-[-90deg] transition-all duration-1000 ease-out"
      >
        {/* Background Circle */}
        <circle
          stroke="#334155"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress Circle */}
        <circle
          stroke={color}
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
      
      {/* Inner Text */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <span className="block text-4xl font-bold text-white tracking-tighter" style={{ textShadow: `0 0 20px ${glowColor}`}}>
          {Math.round(currentMg)}
        </span>
        <span className="text-xs text-slate-400 uppercase font-medium">殘留量</span>
      </div>
    </div>
  );
};

export default MetabolicGauge;