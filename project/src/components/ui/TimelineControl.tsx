import React from 'react';

interface TimelineControlProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}

export const TimelineControl: React.FC<TimelineControlProps> = ({
  value,
  onChange,
  min,
  max,
  step
}) => {
  const phases = [
    { year: 5, label: 'Phase 1', color: 'bg-blue-500' },
    { year: 15, label: 'Phase 2', color: 'bg-green-500' },
    { year: 30, label: 'Phase 3', color: 'bg-yellow-500' },
    { year: 50, label: 'Long-term', color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Development Timeline
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value} years
        </span>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between mt-2">
          {phases.map((phase, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className={`w-3 h-3 rounded-full ${
                  value >= phase.year ? phase.color : 'bg-gray-300 dark:bg-gray-600'
                }`} 
              />
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {phase.label}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500">
                {phase.year}y
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};