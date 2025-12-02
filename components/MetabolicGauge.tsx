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
  const percentage = Math.min(100, (currentMg / limitMg) * 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let color = '#65a30d'; // Lime 600
  let glowColor = 'rgba(101, 163, 13, 0.2)';
  
  if (status === 'warning') {
    color = '#ea580c'; // Orange 600
    glowColor = 'rgba(234, 88, 12, 0.2)';
  } else if (status === 'danger') {
    color = '#dc2626'; // Red 600
    glowColor = 'rgba(220, 38, 38, 0.2)';
  }

  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="rotate-[-90deg] transition-all duration-1000 ease-out"
      >
        {/* Background Circle - Light Stone */}
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
        <span className="block text-4xl font-bold text-stone-700 tracking-tighter" style={{ textShadow: `0 0 20px ${glowColor}`}}>
          {Math.round(currentMg)}
        </span>
        <span className="text-xs text-stone-500 uppercase font-medium">殘留量</span>
      </div>
    </div>
  );
};

export default MetabolicGauge;